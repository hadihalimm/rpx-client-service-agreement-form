import axios from 'axios';
import './App.css';
import CompanyForm from './components/CompanyForm';
import { Label } from './components/ui/label';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { useEffect, useState } from 'react';
import PersonalForm from './components/PersonalForm';
import { Separator } from './components/ui/separator';
import { Card } from './components/ui/card';

function App() {
  const [provinces, setProvinces] = useState<Province[]>();
  const [cities, setCities] = useState<City[]>();
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>();
  const [villages, setVillages] = useState<Village[]>();
  const [formType, setFormType] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let res = await axios.get('/provinces.json');
        setProvinces(res.data as Province[]);
        res = await axios.get('/cities.json');
        setCities(res.data as City[]);
        res = await axios.get('/districts.json');
        setSubDistricts(res.data as SubDistrict[]);
        res = await axios.get('/villages.json');
        setVillages(res.data as Village[]);
      } catch (err) {
        console.error('Error loading data: ', err);
      }
    };
    loadData();
  }, []);
  return (
    <main className="flex flex-col justify-center w-full max-w-md mx-auto p-4 gap-y-8 mb-12">
      <Card className="px-4 shadow-xl border-primary border-2">
        <section className="flex space-x-4 items-center justify-between">
          <div className="flex gap-x-4">
            <img src="/rpx-logo.png" className="w-[50px] h-[50px]" />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg">Service Agreement</h1>
              <h1 className="text-md">Kesepakatan Layanan</h1>
            </div>
          </div>
          <div>
            <div className="flex flex-col text-[9px] text-end">
              <p>RPX center</p>
              <p>Jl. Ciputat Raya No. 99</p>
              <p>Jakarta 12310</p>
              <p>Whats app: 0811 779 8800</p>
              <a
                href="www.rpx.co.id
">
                www.rpx.co.id
              </a>
            </div>
          </div>
        </section>

        <section>
          <RadioGroup
            className="flex space-x-2"
            onValueChange={(value) => setFormType(value)}
            value={formType}>
            <Label>Client type: </Label>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" />
              <Label>Company</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" />
              <Label>Personal</Label>
            </div>
          </RadioGroup>
        </section>
        <Separator />

        {formType === 'company' && (
          <CompanyForm
            provinces={provinces!}
            cities={cities!}
            subDistricts={subDistricts!}
            villages={villages!}
          />
        )}

        {formType === 'personal' && (
          <PersonalForm
            provinces={provinces!}
            cities={cities!}
            subDistricts={subDistricts!}
            villages={villages!}
          />
        )}
      </Card>
    </main>
  );
}

export default App;
