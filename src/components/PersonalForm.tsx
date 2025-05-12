/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate-no-encryption';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Combobox } from './ui/combobox';
import { Separator } from './ui/separator';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { useFileInput } from '@/hooks/use-fileInput';
import axios from 'axios';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface PersonalFormProps {
  provinces: Province[];
  cities: City[];
  subDistricts: SubDistrict[];
  villages: Village[];
}

const PersonalForm = ({
  provinces,
  cities,
  subDistricts,
  villages,
}: PersonalFormProps) => {
  const form = useForm({
    defaultValues: {
      companyName: '',
      address: '',
      province: '',
      city: '',
      subDistrict: '',
      postalCode: '',
      industry: '',
      idNumber: '',
      contactName: '',
      jobTitle: '',
      email: '',
      phone: '',
      phoneExt: '',
      mobilePhone: '',
      billingCompanyName: '',
      billingAddress: '',
      billingProvince: '',
      billingCity: '',
      billingSubDistrict: '',
      billingPostalCode: '',
      billingContactName: '',
      billingEmployeeID: '',
      billingJobTitle: '',
      billingEmail: '',
      billingPhone: '',
      billingPhoneExt: '',
      billingMobilePhone: '',
    },
    onSubmit: async ({ value }) => {
      console.log(ktpFile.file);
      if (!ktpFile.file) {
        alert('Silahkan upload KTP atau Passsport');
        return;
      }
      if (signatureType === 'upload' && !handsignFile.file) {
        alert('Please upload signature file');
        return;
      }
      if (signatureType === 'create' && !signatureBlob) {
        alert('Please create a signature');
        return;
      }
      setIsSubmitting(true);

      const res = await axios.get('/form.xlsx', {
        responseType: 'arraybuffer',
      });
      const workbook = await XlsxPopulate.fromDataAsync(res.data);
      const sheet = workbook.sheet('Sheet1');
      if (!sheet) {
        console.error("Worksheet 'Sheet1' not found");
        return;
      }
      // 3. Update ALL cells (your complete mapping)
      // --- Company Information ---
      sheet.cell('J9').value(value.companyName);
      sheet.cell('J10').value(value.address);

      // City (conditional placement)
      if (value.city.startsWith('Kab')) {
        sheet.cell('AC11').value(value.city);
      } else {
        sheet.cell('J12').value(value.city);
      }

      sheet.cell('AC12').value(value.subDistrict);
      sheet.cell('AC13').value(village?.postal_code);
      sheet.cell('J13').value(value.industry);
      sheet.cell('AC14').value(value.idNumber);

      // --- Contact Information ---
      sheet.cell('J16').value(value.contactName);
      sheet.cell('J17').value(value.jobTitle);
      sheet.cell('J18').value(value.email);
      sheet.cell('J19').value(value.phone);
      sheet.cell('Y19').value(value.phoneExt);
      sheet.cell('J20').value(value.mobilePhone);

      // --- Billing Information ---
      sheet.cell('J23').value(value.billingCompanyName);
      sheet.cell('J24').value(value.billingAddress);
      sheet.cell('J26').value(value.billingCity);
      sheet.cell('AB26').value(billingVillage?.postal_code);
      sheet.cell('J27').value(value.contactName);
      sheet.cell('J28').value(value.billingEmployeeID);
      sheet.cell('J29').value(value.billingJobTitle);
      sheet.cell('J30').value(value.billingEmail);
      sheet.cell('J31').value(value.billingPhone);
      sheet.cell('Y31').value(value.billingPhoneExt);
      sheet.cell('J32').value(value.billingMobilePhone);

      // 4. Generate and download
      const blob = await workbook.outputAsync().then(
        (buffer: any) =>
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
      );

      const sheetFile = new File(
        [blob],
        `${value.companyName}_Service Agreement.xlsx`,
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      );
      const formData = new FormData();
      formData.append('clientName', value.companyName);
      formData.append('excel', sheetFile);
      if (ktpFile.file)
        formData.append(
          'ktpFile',
          new File([ktpFile.file], `${value.companyName}_KTP`, {
            type: ktpFile.file.type,
          }),
        );

      if (handsignFile.file)
        formData.append(
          'signature',
          new File([handsignFile.file], `${value.companyName}_Signature`, {
            type: handsignFile.file.type,
          }),
        );
      if (signatureBlob) formData.append('signature', signatureBlob);

      try {
        const res = await axios.post(
          'http://localhost:8888/.netlify/functions/upload-to-drive',
          formData,
        );
        if (res.status === 200) {
          alert(
            'Thank you! Your form has been successfully submitted and your files have been uploaded to Google Drive. \n\nRPX - your one-stop logistics solution.',
          );
        } else {
          alert(
            'Submission failed. Please try again. If the issue persists, contact RPX support.',
          );
        }
        setIsSubmitting(false);
      } catch (err) {
        alert(
          'Submission failed. Please try again. If the issue persists, contact RPX support.',
        );
        console.error(err);
        setIsSubmitting(false);
      }
    },
  });
  const [province, setProvince] = useState<Province>();
  const [filteredCities, setFilteredCities] = useState<City[]>();
  const [city, setCity] = useState<City>();
  const [filteredSubDistricts, setFilteredSubDistricts] =
    useState<SubDistrict[]>();
  const [subDistrict, setSubDistrict] = useState<SubDistrict>();
  const [filteredVillages, setFilteredVillages] = useState<Village[]>();
  const [village, setVillage] = useState<Village>();
  const [billingProvince, setBillingProvince] = useState<Province>();
  const [filteredBillingCities, setFilteredBillingCities] = useState<City[]>();
  const [billingCity, setBillingCity] = useState<City>();
  const [filteredBillingSubDistricts, setFilteredBillingSubDistricts] =
    useState<SubDistrict[]>();
  const [billingSubDistrict, setBillingSubDistrict] = useState<SubDistrict>();
  const [filteredBillingVillages, setFilteredBillingVillages] =
    useState<Village[]>();
  const [billingVillage, setBillingVillage] = useState<Village>();
  const ktpFile = useFileInput();
  const handsignFile = useFileInput();
  const [, setSignature] = useState<string | null>(null);
  const [signatureBlob, setSignatureBlob] = useState<File>();
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const [signatureType, setSignatureType] = useState('upload');
  const [autoFillBilling, setAutoFillBilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (province) {
      const filtered = cities?.filter((city) =>
        city.code.startsWith(`${province.code}.`),
      );
      setFilteredCities(filtered);
    }
  }, [province, cities]);

  useEffect(() => {
    if (billingProvince) {
      const filtered = cities?.filter((city) =>
        city.code.startsWith(`${billingProvince.code}.`),
      );
      setFilteredBillingCities(filtered);
    }
  }, [billingProvince, cities]);

  useEffect(() => {
    if (city) {
      const filtered = subDistricts?.filter((sd) =>
        sd.code.startsWith(`${city.code}.`),
      );
      setFilteredSubDistricts(filtered);
    }
  }, [city, subDistricts]);

  useEffect(() => {
    if (billingCity) {
      const filtered = subDistricts?.filter((sd) =>
        sd.code.startsWith(`${billingCity.code}.`),
      );
      setFilteredBillingSubDistricts(filtered);
    }
  }, [billingCity, subDistricts]);

  useEffect(() => {
    if (subDistrict) {
      const filtered = villages?.filter((village) =>
        village.code.startsWith(`${subDistrict.code}.`),
      );
      setFilteredVillages(filtered);
    }
  }, [subDistrict, villages]);

  useEffect(() => {
    if (billingSubDistrict) {
      const filtered = villages?.filter((village) =>
        village.code.startsWith(`${billingSubDistrict.code}.`),
      );
      setFilteredBillingVillages(filtered);
    }
  }, [billingSubDistrict, villages]);

  useEffect(() => {
    if (autoFillBilling) {
      form.setFieldValue(
        'billingCompanyName',
        form.getFieldValue('companyName'),
      );
      form.setFieldValue('billingAddress', form.getFieldValue('address'));
      form.setFieldValue('billingProvince', form.getFieldValue('province'));
      setBillingProvince(
        provinces.find(
          (province) => province.name === form.getFieldValue('province'),
        ),
      );
      form.setFieldValue('billingCity', form.getFieldValue('city'));
      setBillingCity(
        filteredCities?.find(
          (city) => city.name === form.getFieldValue('city'),
        ),
      );
      form.setFieldValue(
        'billingSubDistrict',
        form.getFieldValue('subDistrict'),
      );
      setBillingSubDistrict(
        filteredSubDistricts?.find(
          (sd) => sd.name === form.getFieldValue('subDistrict'),
        ),
      );
      form.setFieldValue('billingPostalCode', form.getFieldValue('postalCode'));
      setBillingVillage(
        filteredVillages?.find(
          (village) => village.name === form.getFieldValue('postalCode'),
        ),
      );
      form.setFieldValue(
        'billingContactName',
        form.getFieldValue('contactName'),
      );
      form.setFieldValue('billingEmployeeID', form.getFieldValue('idNumber'));
      form.setFieldValue('billingJobTitle', form.getFieldValue('jobTitle'));
      form.setFieldValue('billingEmail', form.getFieldValue('email'));
      form.setFieldValue('billingPhone', form.getFieldValue('phone'));
      form.setFieldValue('billingPhoneExt', form.getFieldValue('phoneExt'));
      form.setFieldValue(
        'billingMobilePhone',
        form.getFieldValue('mobilePhone'),
      );
    }
  }, [autoFillBilling]);

  const saveSignature = async () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current
        .getCanvas()
        .toDataURL('image/png');
      setSignature(dataUrl);
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File(
        [blob],
        `${form.getFieldValue('companyName')}_Signature.png`,
        { type: 'image/png' },
      );
      setSignatureBlob(file);
    }
  };
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignature(null);
      setSignatureBlob(undefined);
    }
  };

  return (
    <form
      className="flex flex-col gap-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}>
      <p className="font-bold text-lg bg-primary w-fit py-1 px-2 rounded-md">
        Personal Information
      </p>
      <form.Field
        name="companyName"
        validators={{
          onChange: z.string().min(1, 'Company name is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Personal name</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="address"
        validators={{
          onChange: z.string().min(1, 'Address is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="province"
        validators={{
          onChange: z.string().min(1, 'Province is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Province</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = provinces?.find(
                  (province) => province.name === val,
                );
                setProvince(selected);
              }}
              options={
                provinces?.map((province) => ({
                  label: province.name,
                  value: province.name,
                })) ?? []
              }
              placeholder="Select province"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="city"
        validators={{
          onChange: z.string().min(1, 'City/District is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>City / District</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredCities?.find(
                  (city) => city.name === val,
                );
                setCity(selected);
              }}
              options={
                filteredCities?.map((city) => ({
                  label: city.name,
                  value: city.name,
                })) ?? []
              }
              placeholder="Select city / district"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="subDistrict"
        validators={{
          onChange: z.string().min(1, 'Sub-district is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Sub-district</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredSubDistricts?.find(
                  (sd) => sd.name === val,
                );
                setSubDistrict(selected);
              }}
              options={
                filteredSubDistricts?.map((sd) => ({
                  label: sd.name,
                  value: sd.name,
                })) ?? []
              }
              placeholder="Select sub-district"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="postalCode"
        validators={{
          onChange: z.string().min(1, 'Postal code is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Postal code</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredVillages?.find(
                  (village) => village.name === val,
                );
                setVillage(selected);
              }}
              options={
                filteredVillages?.map((village) => ({
                  label: `${village.name} - ${village.postal_code}`,
                  value: village.name,
                })) ?? []
              }
              placeholder="Select postal code"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="industry"
        validators={{
          onChange: z.string().min(1, 'Industry is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="idNumber"
        validators={{
          onChange: z.string().min(1, 'ID number is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>ID Number</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="contactName"
        validators={{
          onChange: z.string().min(1, 'Contact name is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Contact name</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="jobTitle"
        validators={{
          onChange: z.string().min(1, 'Job title is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Job title</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{
          onChange: z.string().email(),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="flex gap-x-2">
        <form.Field
          name="phone"
          validators={{
            onChange: z.string().min(1, 'Phone is required'),
          }}>
          {(field) => (
            <div className="w-full space-y-2">
              <Label>Phone</Label>
              <Input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-[10px] text-red-500">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="phoneExt"
          validators={{
            onChange: z.string(),
          }}>
          {(field) => (
            <div className="w-[200px] space-y-2">
              <Label>Ext.</Label>
              <Input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-[10px] text-red-500">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="mobilePhone"
        validators={{
          onChange: z.string().min(1, 'Mobile phone is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Mobile phone</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="space-y-2">
        <Label>Upload KTP / Passport</Label>
        <Input
          type="file"
          onChange={ktpFile.handleChange}
          onClick={ktpFile.markTouched}
          accept=".jpg,.jpeg,.png,.pdf"
        />
        {ktpFile.touched && !ktpFile.file && (
          <p className="text-[10px] text-red-500">KTP / Passport is required</p>
        )}
      </div>

      <Separator />
      <p className="font-bold text-lg bg-primary w-fit py-1 px-2 rounded-md">
        Billing Information
      </p>
      <div className="flex space-x-2">
        <Checkbox
          checked={autoFillBilling}
          onCheckedChange={(checked) => setAutoFillBilling(!!checked)}
        />
        <Label>Same as above</Label>
      </div>

      <form.Field
        name="billingCompanyName"
        validators={{
          onChange: z.string().min(1, 'Personal name is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Personal name</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingAddress"
        validators={{
          onChange: z.string().min(1, 'Address is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingProvince"
        validators={{
          onChange: z.string().min(1, 'Province is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Province</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = provinces?.find(
                  (province) => province.name === val,
                );
                setBillingProvince(selected);
              }}
              options={
                provinces?.map((province) => ({
                  label: province.name,
                  value: province.name,
                })) ?? []
              }
              placeholder="Select province"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingCity"
        validators={{
          onChange: z.string().min(1, 'City/District is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>City / District</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredBillingCities?.find(
                  (city) => city.name === val,
                );
                setBillingCity(selected);
              }}
              options={
                filteredBillingCities?.map((city) => ({
                  label: city.name,
                  value: city.name,
                })) ?? []
              }
              placeholder="Select city / district"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingSubDistrict"
        validators={{
          onChange: z.string().min(1, 'Sub-district is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Sub-district</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredBillingSubDistricts?.find(
                  (sd) => sd.name === val,
                );
                setBillingSubDistrict(selected);
              }}
              options={
                filteredBillingSubDistricts?.map((sd) => ({
                  label: sd.name,
                  value: sd.name,
                })) ?? []
              }
              placeholder="Select sub-district"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingPostalCode"
        validators={{
          onChange: z.string().min(1, 'Postal code is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Postal code</Label>
            <Combobox
              value={field.state.value}
              onChange={(val) => {
                field.handleChange(val);
                const selected = filteredBillingVillages?.find(
                  (village) => village.name === val,
                );
                setBillingVillage(selected);
              }}
              options={
                filteredBillingVillages?.map((village) => ({
                  label: `${village.name} - ${village.postal_code}`,
                  value: village.name,
                })) ?? []
              }
              placeholder="Select postal code"
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingContactName"
        validators={{
          onChange: z.string().min(1, 'Contact name is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Contact name</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingEmployeeID"
        validators={{
          onChange: z.string().min(1, 'Employee ID is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingJobTitle"
        validators={{
          onChange: z.string().min(1, 'Job title is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Job title</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="billingEmail"
        validators={{
          onChange: z.string().email(),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="flex gap-x-2">
        <form.Field
          name="billingPhone"
          validators={{
            onChange: z.string().min(1, 'Phone is required'),
          }}>
          {(field) => (
            <div className="w-full space-y-2">
              <Label>Phone</Label>
              <Input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-[10px] text-red-500">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="billingPhoneExt"
          validators={{
            onChange: z.string(),
          }}>
          {(field) => (
            <div className="w-[200px] space-y-2">
              <Label>Ext.</Label>
              <Input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-[10px] text-red-500">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="billingMobilePhone"
        validators={{
          onChange: z.string().min(1, 'Mobile phone is required'),
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label>Mobile phone</Label>
            <Input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-[10px] text-red-500">
                {field.state.meta.errors.map((err) => err?.message).join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Separator />
      <div className="space-y-2 flex flex-col">
        <Label>Handsign</Label>
        <RadioGroup
          className="flex"
          onValueChange={(value) => setSignatureType(value)}
          value={signatureType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" />
            <Label>Upload</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="create" />
            <Label>Create</Label>
          </div>
        </RadioGroup>
        {signatureType === 'upload' && (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={handsignFile.handleChange}
              onClick={handsignFile.markTouched}
            />
            {handsignFile.touched && !handsignFile.file && (
              <p className="text-[10px] text-red-500">Handsign is required</p>
            )}
          </div>
        )}
        {signatureType === 'create' && (
          <div className="space-y-2 flex flex-col">
            <SignatureCanvas
              ref={signaturePadRef}
              penColor="black"
              canvasProps={{ className: 'border rounded-md w-full h-[150px]' }}
              onEnd={saveSignature}
            />
            <Button
              type="button"
              onClick={clearSignature}
              className="w-1/6 ml-auto"
              variant="secondary">
              Clear
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  );
};

export default PersonalForm;
