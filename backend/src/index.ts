import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { BusinessCase, BusinessCaseResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;
const HOUR_MS = 1000 * 60 * 60;

// Middleware
app.use(cors());
app.use(express.json());


const dataPath = path.join(process.cwd(), '../data/data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const jsonData: BusinessCaseResponse = JSON.parse(rawData);
let lastSorted = new Date();

function lastActivity(bc: BusinessCase): Date{
	if(bc.prevActivity === null){
		return new Date(bc.validFrom);
	}
	return new Date(bc.prevActivity);
}


function reSort(){
	const now = new Date()
	jsonData.data.sort((bc) => {
		return lastActivity(bc).getTime() - now.getTime();
	});
	lastSorted = now;
}

reSort()
//TODO: filter only BusinessCases

// Data endpoint
app.get('/api/cases', (req, res) => {

  if(Date.now() - lastSorted.getTime() > HOUR_MS * 24){
	  reSort();
  }

  try {
	
    const dataRows = jsonData.data.slice(0, 10).map((item: BusinessCase) => ({
      id: item.id,
      name: item.name,
      code: item.code,
	  status: item.status,
	  companyName: item.company.name,
	  companyId: item.company.id,
	  companyEmail: item.company.primaryAddress['contactInfo.email'],
	  amount: item.totalAmountInDefaultCurrency,
	  lastActivity: lastActivity(item),
	  person: item.owner.fullName,
	  probability: item.probability,
      type: item._entityName

    }));

    res.json({
      message: 'Returning sorted BusinessCase(s)',
      timestamp: new Date().toISOString(),
      status: 'ok',
      dataRows
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({
      message: 'Error reading data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
  console.log(`📋 API dostupné na http://localhost:${PORT}/api/hello`);
});

export default app;
