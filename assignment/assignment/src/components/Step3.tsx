import React from "react";

type Step3Props = {
  data: any;
  onBack: () => void;
};

export default function Step3({ data, onBack }: Step3Props) {
  const handleSubmit = () => {
    console.log("✅ Form submitted with data:", data);
    alert("Form submitted!");
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Confirm Your Details</h2>

      {/* Personal Details */}
      <section className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-bold mb-2">Step 1: Personal Information</h3>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Gender:</strong> {data.gender}</p>
        <p><strong>Address:</strong> {data.address}</p>
        <p><strong>City:</strong> {data.city}</p>
        <p><strong>Country:</strong> {data.country}</p>
        <p><strong>Date of Birth (BS):</strong> {data.dateOfBirthBS}</p>
        <p><strong>Date of Birth (AD):</strong> {data.dateOfBirthAD}</p>
      </section>

      {/* Citizenship Details */}
      <section className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-bold mb-2">Step 2: Citizenship Information</h3>
        <p><strong>Citizenship Number:</strong> {data.citizenshipNumber}</p>
        <p><strong>Issued District:</strong> {data.issuedDistrict}</p>
        <p><strong>Issued Date (BS):</strong> {data.issuedDateBS}</p>
        <p><strong>Issued Date (AD):</strong> {data.issuedDateAD}</p>

        <div className="mt-3">
          <strong>Front Image:</strong>
          {data.frontFilePreview && data.frontFilePreview.startsWith("data:image") ? (
            <img src={data.frontFilePreview} alt="Citizenship Front" className="mt-2 max-w-xs border" />
          ) : data.frontFilePreview ? (
            <p className="mt-2">PDF file selected</p>
          ) : (
            <p className="mt-2 text-gray-500">No file uploaded</p>
          )}
        </div>

        <div className="mt-3">
          <strong>Back Image:</strong>
          {data.backFilePreview && data.backFilePreview.startsWith("data:image") ? (
            <img src={data.backFilePreview} alt="Citizenship Back" className="mt-2 max-w-xs border" />
          ) : data.backFilePreview ? (
            <p className="mt-2">PDF file selected</p>
          ) : (
            <p className="mt-2 text-gray-500">No file uploaded</p>
          )}
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
