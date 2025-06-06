// 'use client'; // Make this a Client Component

// import { useState, useEffect } from 'react';
// import useDebounce from '@/hooks/useDebounce'; // Ensure this path is correct

// // --- Interfaces (Define the structure of your data from Strapi) ---
// interface Helpline {
//     id: number;
//     name: string;
//     number: string;
//     description: any; // Use 'any' or a specific type for Strapi's rich text structure
//     scope: string;
//     languages: string;
//     createdAt: string;
//     updatedAt: string;
//     publishedAt: string;
// }

// interface Ngo {
//     id: number;
//     name: string;
//     description: any;
//     services_offered: any;
//     phone_number?: string | null; // Mark optional fields that might be null/missing
//     email?: string | null;
//     website?: string | null;
//     address_line1?: string | null;
//     city: string;
//     state: string;
//     pincode?: string | null;
//     createdAt: string;
//     updatedAt: string;
//     publishedAt: string;
// }

// interface LegalResource {
//     id: number;
//     title: string;
//     summary_of_law: any;
//     relevant_sections: any;
//     procedure_for_reporting: any;
//     createdAt: string;
//     updatedAt: string;
//     publishedAt: string;
// }

// // Type for category keys used in activeTab state
// type Category = 'helplines' | 'ngos' | 'legalResources';

// // --- Basic Helper to Extract Plain Text from Strapi Rich Text/Text fields ---
// // Consider using a library like @strapi/blocks-react-renderer for proper HTML rendering if needed.
// const getSimpleRichText = (field: any): string => {
//     if (!field) return ''; // Handle null or undefined input
//     if (typeof field === 'string') return field; // Return if it's already a string
//     if (Array.isArray(field)) {
//         // Attempt to extract text from Strapi's default rich text block structure
//         return field
//             .map(block => {
//                 if (block.type === 'paragraph' && Array.isArray(block.children)) {
//                     return block.children.map((child: any) => child.text || '').join('');
//                 }
//                 // Add handlers for other block types (lists, headings) if needed
//                 return '';
//             })
//             .join('\n') // Join paragraphs with newline for basic structure
//             .trim();
//     }
//     return ''; // Fallback for unknown structures
// };


// // --- The Main Page Component ---
// export default function HomePage() {
//     // --- State Variables ---
//     const [helplines, setHelplines] = useState<Helpline[]>([]);
//     const [ngos, setNgos] = useState<Ngo[]>([]);
//     const [legalResources, setLegalResources] = useState<LegalResource[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [searchTerm, setSearchTerm] = useState<string>(''); // Live search input
//     const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounced value for filtering
//     const [activeTab, setActiveTab] = useState<Category>('helplines'); // Default visual tab

//     // --- Data Fetching Effect (runs once on component mount) ---
//     useEffect(() => {
//         async function loadData() {
//             setIsLoading(true);
//             setError(null);
//             try {
//                 // Fetch all resource types from our local API route handler
//                 const response = await fetch('/api/resources');
//                 if (!response.ok) {
//                     throw new Error(`API Error: ${response.statusText} (${response.status})`);
//                 }
//                 const data = await response.json();

//                 // Update state with fetched data, providing empty arrays as fallbacks
//                 setHelplines(data.helplines || []);
//                 setNgos(data.ngos || []);
//                 setLegalResources(data.legalResources || []);

//                 // Set error state if the API route reported issues during its fetch
//                 if (data.errors && data.errors.length > 0) {
//                     console.warn("Client: Received errors from API route:", data.errors);
//                     setError("Some resource data might be missing or failed to load.");
//                 }
//             } catch (err: any) {
//                 console.error("Client: Failed to fetch data from /api/resources:", err);
//                 setError(`Failed to load resources: ${err.message}. Please try refreshing.`);
//                 // Clear data on critical fetch error
//                 setHelplines([]);
//                 setNgos([]);
//                 setLegalResources([]);
//             } finally {
//                 setIsLoading(false); // Ensure loading state is turned off
//             }
//         }

//         loadData();
//     }, []); // Empty dependency array ensures this runs only once on mount

//     // --- Filtering Logic (using the debounced search term) ---
//     const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();

//     // Generic filtering function
//     const filterItems = <T extends { [key: string]: any }>(items: T[], fieldsToSearch: string[]): T[] => {
//         // If no search term, return all items immediately
//         // We want to show all items when search is empty, regardless of the active tab now
//         // if (!lowerCaseSearchTerm) return items;

//         return items.filter(item => {
//             if (!item) return false; // Skip if item is somehow null/undefined

//              // If search term is empty, include the item
//              if (!lowerCaseSearchTerm) return true;

//             // Check if the search term matches any of the specified fields
//             return fieldsToSearch.some(fieldKey => {
//                 let fieldValue = item[fieldKey]; // Get the value of the current field

//                 // Special handling for combined address field for NGOs
//                 if (fieldKey === 'address' && 'city' in item) {
//                     fieldValue = [item.address_line1, item.city, item.state, item.pincode].filter(Boolean).join(', ');
//                 }
//                 // Special handling for potentially rich text fields
//                 else if (['description', 'summary_of_law', 'relevant_sections', 'procedure_for_reporting', 'services_offered'].includes(fieldKey)) {
//                     fieldValue = getSimpleRichText(fieldValue);
//                 }

//                 // Perform case-insensitive search if the field value is a string
//                 return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(lowerCaseSearchTerm);
//             });
//         });
//     };

//     // Apply filtering to each resource type
//     const filteredHelplines = filterItems(helplines, ['name', 'number', 'description', 'scope', 'languages']);
//     const filteredNgos = filterItems(ngos, ['name', 'description', 'services_offered', 'address', 'phone_number', 'email', 'website']); // Added 'address' pseudo-field
//     const filteredLegalResources = filterItems(legalResources, ['title', 'summary_of_law', 'relevant_sections', 'procedure_for_reporting']);

//     // --- JSX Rendering ---
//     return (
//         <main className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 text-gray-900 font-sans">
//             {/* Decorative top border with Indian flag colors */}
//             <div className="w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

//             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//                 {/* Header Section with Indian-themed decorative elements */}
//                 <header className="text-center mb-10 md:mb-12 relative">
//                     {/* Decorative elements - lotus flower patterns (stylized with divs) */}
//                     <div className="hidden md:block absolute left-10 top-1/2 transform -translate-y-1/2 text-pink-400 opacity-20 text-6xl">
//                         ✿
//                     </div>
//                     <div className="hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2 text-pink-400 opacity-20 text-6xl">
//                         ✿
//                     </div>

//                     <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-pink-800">
//                         JanaHub India
//                     </h1>
//                     <div className="w-24 h-1 bg-orange-500 mx-auto my-4"></div>
//                     <p className="mt-3 text-lg sm:text-xl text-pink-700 max-w-2xl mx-auto">
//                         Find verified helplines, support NGOs, and essential legal information for women's safety.
//                     </p>
//                 </header>

//                 {/* Search Input Section with Indian-inspired styling */}
//                 <div className="w-full max-w-xl mx-auto mb-8">
//                     <div className="relative">
//                         <label htmlFor="search-resources" className="sr-only">Search all resources</label>
//                         <input
//                             id="search-resources"
//                             type="search"
//                             placeholder="Search by name, location, service, law..."
//                             className="w-full px-5 py-3 border-2 border-orange-300 rounded-full shadow-sm placeholder-orange-300
//                                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300
//                                     transition duration-200 ease-in-out bg-white"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                         <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
//                             <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                             </svg>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Tabs Navigation Section with Indian palette */}
//                 <nav className="flex justify-center border-b border-orange-200 mb-10 md:mb-12" aria-label="Resource categories">
//                     <button
//                         onClick={() => setActiveTab('helplines')}
//                         className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
//                                   ${activeTab === 'helplines'
//                                     ? 'border-pink-600 text-pink-700 font-semibold'
//                                     : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`}
//                         aria-current={activeTab === 'helplines' ? 'page' : undefined}
//                     >
//                         Helplines
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('ngos')}
//                         className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
//                                   ${activeTab === 'ngos'
//                                     ? 'border-pink-600 text-pink-700 font-semibold'
//                                     : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`}
//                         aria-current={activeTab === 'ngos' ? 'page' : undefined}
//                     >
//                         NGOs
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('legalResources')}
//                         className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
//                                   ${activeTab === 'legalResources'
//                                     ? 'border-pink-600 text-pink-700 font-semibold'
//                                     : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`}
//                         aria-current={activeTab === 'legalResources' ? 'page' : undefined}
//                     >
//                         Legal Info
//                     </button>
//                 </nav>

//                 {/* Loading State Display */}
//                 {isLoading && (
//                     <div className="text-center py-16">
//                         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-4"></div>
//                         <p className="text-lg text-pink-600">Loading resources...</p>
//                     </div>
//                 )}

//                 {/* Error State Display */}
//                 {error && !isLoading && (
//                     <div className="max-w-3xl mx-auto bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-10 rounded-r-lg shadow-sm" role="alert">
//                         <p className="font-bold">Error Loading Data</p>
//                         <p>{error}</p>
//                     </div>
//                 )}

//                 {/* --- Main Content Area (Results) --- */}
//                 {!isLoading && !error && (
//                     <div className="space-y-12 md:space-y-16">

//                         {/* Helpline Section */}
//                         {/* Show section only if the active tab is 'helplines' */}
//                         {activeTab === 'helplines' && (
//                             <section aria-labelledby="helpline-heading" className="transition-opacity duration-300 ease-in-out">
//                                 <h2 id="helpline-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
//                                     <span className="bg-pink-100 text-pink-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8">
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                             <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                                         </svg>
//                                     </span>
//                                     Helplines
//                                     <span className="text-base font-normal text-orange-500 ml-2">({filteredHelplines.length})</span>
//                                 </h2>
//                                 {filteredHelplines.length > 0 ? (
//                                     <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                         {filteredHelplines.map((helpline) => (
//                                             <li key={helpline.id} className="bg-white p-5 rounded-lg shadow-md border border-orange-100 hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col relative overflow-hidden group">
//                                                 {/* Decorative accent */}
//                                                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-pink-500"></div>

//                                                 <h3 className="text-lg font-semibold text-pink-700 mb-2 group-hover:text-pink-800 transition-colors duration-200">{helpline.name}</h3>
//                                                 <div className="space-y-2 text-sm text-gray-700 flex-grow">
//                                                     <p className="flex items-center">
//                                                         <span className="inline-block bg-orange-100 p-1 rounded-full mr-2">
//                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                 <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                                                             </svg>
//                                                         </span>
//                                                         <a href={`tel:${helpline.number}`} className="text-pink-600 hover:text-pink-800 hover:underline break-words font-medium">
//                                                             {helpline.number}
//                                                         </a>
//                                                     </p>
//                                                     <p className="flex items-start">
//                                                         <span className="inline-block bg-orange-100 p-1 rounded-full mr-2 mt-0.5">
//                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                 <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                                                             </svg>
//                                                         </span>
//                                                         <span>{helpline.scope}</span>
//                                                     </p>
//                                                     <p className="flex items-start">
//                                                         <span className="inline-block bg-orange-100 p-1 rounded-full mr-2 mt-0.5">
//                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                 <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
//                                                             </svg>
//                                                         </span>
//                                                         <span>{helpline.languages}</span>
//                                                     </p>
//                                                     <p className="text-gray-600 pt-2 mt-2 text-xs italic border-t border-orange-100">
//                                                         {getSimpleRichText(helpline.description)}
//                                                     </p>
//                                                 </div>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No helplines match your search.' : 'No helplines found in this category.'}</p>
//                                 )}
//                             </section>
//                         )}

//                         {/* NGO Section */}
//                         {/* Show section only if the active tab is 'ngos' */}
//                          {activeTab === 'ngos' && (
//                             <section aria-labelledby="ngo-heading" className="transition-opacity duration-300 ease-in-out">
//                                 <h2 id="ngo-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
//                                     <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8">
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                             <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
//                                         </svg>
//                                     </span>
//                                     NGOs
//                                     <span className="text-base font-normal text-orange-500 ml-2">({filteredNgos.length})</span>
//                                 </h2>
//                                  {filteredNgos.length > 0 ? (
//                                     <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                         {filteredNgos.map((ngo) => {
//                                             const descriptionText = getSimpleRichText(ngo.description);
//                                             const servicesText = getSimpleRichText(ngo.services_offered);
//                                             const addressString = [ngo.address_line1, ngo.city, ngo.state, ngo.pincode].filter(Boolean).join(', ');
//                                             return (
//                                                 <li key={ngo.id} className="bg-white p-5 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col relative overflow-hidden group">
//                                                     {/* Decorative accent */}
//                                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>

//                                                     <h3 className="text-lg font-semibold text-green-700 mb-2 group-hover:text-green-800 transition-colors duration-200">{ngo.name}</h3>
//                                                     <div className="space-y-2 text-sm text-gray-700 flex-grow">
//                                                         {descriptionText && <p className="text-gray-600 pb-2 text-xs italic border-b border-green-100 mb-2">{descriptionText}</p>}

//                                                         {servicesText && (
//                                                             <p className="flex items-start">
//                                                                 <span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                         <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                                                     </svg>
//                                                                 </span>
//                                                                 <span className="flex-1">{servicesText}</span>
//                                                             </p>
//                                                         )}

//                                                         {addressString && (
//                                                             <p className="flex items-start">
//                                                                 <span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                         <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                                                                     </svg>
//                                                                 </span>
//                                                                 <span className="flex-1">{addressString}</span>
//                                                             </p>
//                                                         )}

//                                                         {ngo.phone_number && (
//                                                             <p className="flex items-start">
//                                                                 <span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                         <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                                                                     </svg>
//                                                                 </span>
//                                                                 <a href={`tel:${ngo.phone_number}`} className="text-green-600 hover:text-green-800 hover:underline break-words">
//                                                                     {ngo.phone_number}
//                                                                 </a>
//                                                             </p>
//                                                         )}

//                                                         {ngo.email && (
//                                                             <p className="flex items-start">
//                                                                 <span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                                                                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                                                                     </svg>
//                                                                 </span>
//                                                                 <a href={`mailto:${ngo.email}`} className="text-green-600 hover:text-green-800 hover:underline break-all">
//                                                                     {ngo.email}
//                                                                 </a>
//                                                             </p>
//                                                         )}

//                                                         {ngo.website && (
//                                                             <p className="flex items-start">
//                                                                 <span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
//                                                                         <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5a.5.5 0 00.707 0l3-3z" clipRule="evenodd" />
//                                                                         <path fillRule="evenodd" d="M6.586 11.586a2 2 0 10-2.828 2.828l3 3a2 2 0 002.828 0l1.5-1.5a2 2 0 10-2.828-2.828l-1.5 1.5a.5.5 0 01-.707 0l-3-3z" clipRule="evenodd" />
//                                                                     </svg>
//                                                                 </span>
//                                                                 <a href={!ngo.website?.startsWith('http') ? `http://${ngo.website}` : ngo.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 hover:underline break-all">
//                                                                     {ngo.website}
//                                                                 </a>
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </li>
//                                             );
//                                         })}
//                                     </ul>
//                                 ) : (
//                                      <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No NGOs match your search.' : 'No NGOs found in this category.'}</p>
//                                 )}
//                             </section>
//                         )}

//                         {/* Legal Resources Section */}
//                         {/* Show section only if the active tab is 'legalResources' */}
//                          {activeTab === 'legalResources' && (
//                             <section aria-labelledby="legal-heading" className="transition-opacity duration-300 ease-in-out">
//                                 <h2 id="legal-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
//                                     <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8">
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                             <path d="M11.053 2.28a1 1 0 011.894 0l1.405 3.575a1 1 0 00.95.69h3.74a1 1 0 01.7 1.7l-2.829 2.05a1 1 0 00-.364 1.118l1.07 3.39a1 1 0 01-1.54 1.144l-2.89-2.1a1 1 0 00-1.175 0l-2.89 2.1a1 1 0 01-1.54-1.144l1.07-3.39a1 1 0 00-.364-1.118L2.67 8.245a1 1 0 01.7-1.7h3.74a1 1 0 00.95-.69L9.46 2.28zM10 16a6 6 0 100-12 6 6 0 000 12z" />
//                                             <path d="M10 9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" />
//                                         </svg>

//                                     </span>
//                                     Legal Information
//                                     <span className="text-base font-normal text-orange-500 ml-2">({filteredLegalResources.length})</span>
//                                 </h2>
//                                  {filteredLegalResources.length > 0 ? (
//                                     <ul className="space-y-6"> {/* Single column layout */}
//                                         {filteredLegalResources.map((resource) => {
//                                             const summaryText = getSimpleRichText(resource.summary_of_law);
//                                             const sectionsText = getSimpleRichText(resource.relevant_sections);
//                                             const procedureText = getSimpleRichText(resource.procedure_for_reporting);
//                                             return (
//                                                 <li key={resource.id} className="bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-all duration-200 ease-in-out relative overflow-hidden group">
//                                                     {/* Decorative accent */}
//                                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>

//                                                     <h3 className="text-xl font-semibold text-purple-700 mb-4 group-hover:text-purple-800 transition-colors duration-200">{resource.title}</h3>
//                                                     <div className="space-y-5 text-gray-700 leading-relaxed text-sm"> {/* Added more space */}
//                                                         {summaryText && (
//                                                             <div>
//                                                                 <strong className="font-medium text-purple-600 block mb-1 text-base flex items-center">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6a1 1 0 11-2 0V4zm4 11a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" /></svg>
//                                                                     Summary:
//                                                                 </strong>
//                                                                 <p className="pl-6">{summaryText}</p>
//                                                             </div>
//                                                         )}
//                                                         {sectionsText && (
//                                                             <div>
//                                                                 <strong className="font-medium text-purple-600 block mb-1 text-base flex items-center">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
//                                                                     Relevant Sections:
//                                                                 </strong>
//                                                                 <p className="pl-6 whitespace-pre-wrap">{sectionsText}</p> {/* Added whitespace-pre-wrap */}
//                                                             </div>
//                                                         )}
//                                                         {procedureText && (
//                                                             <div>
//                                                                 <strong className="font-medium text-purple-600 block mb-1 text-base flex items-center">
//                                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
//                                                                     Reporting Procedure:
//                                                                 </strong>
//                                                                 <p className="pl-6 whitespace-pre-wrap">{procedureText}</p> {/* Added whitespace-pre-wrap */}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </li>
//                                             );
//                                         })}
//                                     </ul>
//                                 ) : (
//                                     <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No legal information matches your search.' : 'No legal information found in this category.'}</p>
//                                 )}
//                             </section>
//                         )}

//                         {/* --- No Search Results Message --- */}
//                         {/* Show only if user searched and nothing was found in the ACTIVE category */}
//                         {debouncedSearchTerm && (
//                             (activeTab === 'helplines' && filteredHelplines.length === 0) ||
//                             (activeTab === 'ngos' && filteredNgos.length === 0) ||
//                             (activeTab === 'legalResources' && filteredLegalResources.length === 0)
//                         ) && (
//                             <div className="text-center py-16">
//                                 <p className="text-xl text-gray-500">
//                                     No results found for "<span className="font-semibold text-pink-700">{debouncedSearchTerm}</span>" in {
//                                         activeTab === 'helplines' ? 'Helplines' :
//                                         activeTab === 'ngos' ? 'NGOs' : 'Legal Info'
//                                     }.
//                                 </p>
//                                 <p className="text-sm text-gray-400 mt-3">Try searching for a different term, check spelling, or select another category.</p>
//                             </div>
//                         )}

//                          {/* --- Initial Empty State Message --- */}
//                          {/* Show only if not loading, no error, no search term, and the active category is empty */}
//                          {!debouncedSearchTerm && !isLoading && !error && (
//                             (activeTab === 'helplines' && helplines.length === 0) ||
//                             (activeTab === 'ngos' && ngos.length === 0) ||
//                             (activeTab === 'legalResources' && legalResources.length === 0)
//                          ) && (
//                             <div className="text-center py-16">
//                                 <p className="text-lg text-gray-500">
//                                     There are currently no resources listed in the {
//                                         activeTab === 'helplines' ? 'Helplines' :
//                                         activeTab === 'ngos' ? 'NGOs' : 'Legal Info'
//                                     } category.
//                                 </p>
//                                 <p className="text-sm text-gray-400 mt-2">Please check back later or try another category.</p>
//                             </div>
//                          )}


//                     </div>
//                 )}

//                 {/* Footer Section */}
//                 <footer className="text-center mt-16 pt-8 border-t border-orange-200 text-orange-700 text-sm">
//                     JanaHub India | Made with hope | © {new Date().getFullYear()}
//                 </footer>
//             </div>
//         </main>
//     );
// }

//---new_page.tsx
// src/app/page.tsx

'use client'; // Make this a Client Component

import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce'; // Ensure this path is correct

// --- Interfaces (Define the structure of your data from JSON files) ---
interface Helpline {
    id: number; // Assuming your JSON will have an ID or you'll add one
    name: string;
    number: string;
    description: string; // Assuming simple string from CSV conversion
    scope: string;
    languages: string;
    // Remove Strapi-specific fields like createdAt, updatedAt, publishedAt unless they are in your JSON
}

interface Ngo {
    id: number;
    name: string;
    description: string;
    services_offered: string;
    phone_number?: string | null;
    email?: string | null;
    website?: string | null;
    address_line1?: string | null; // Changed from address_line
    city: string;
    state: string;
    pincode?: string | null;
}

interface LegalResource {
    id: number;
    title: string; // Changed from TITLE
    summary_of_law: string;
    relevant_sections: string;
    procedure_for_reporting: string;
}

// Type for category keys used in activeTab state
type Category = 'helplines' | 'ngos' | 'legalResources';

// No need for getSimpleRichText anymore if JSON data is plain text

// --- The Main Page Component ---
export default function HomePage() {
    // --- State Variables ---
    const [helplines, setHelplines] = useState<Helpline[]>([]);
    const [ngos, setNgos] = useState<Ngo[]>([]);
    const [legalResources, setLegalResources] = useState<LegalResource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>(''); // Live search input
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounced value for filtering
    const [activeTab, setActiveTab] = useState<Category>('helplines'); // Default visual tab

    // --- Data Fetching Effect (runs once on component mount) ---
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch data from local JSON files
                const [helplinesRes, ngosRes, legalResourcesRes] = await Promise.all([
                    fetch('/data/helplines.json'),
                    fetch('/data/ngos.json'),
                    fetch('/data/legalresources.json') // Ensure filename matches
                ]);

                if (!helplinesRes.ok) throw new Error(`Failed to fetch helplines: ${helplinesRes.statusText}`);
                if (!ngosRes.ok) throw new Error(`Failed to fetch NGOs: ${ngosRes.statusText}`);
                if (!legalResourcesRes.ok) throw new Error(`Failed to fetch legal resources: ${legalResourcesRes.statusText}`);

                const helplinesData: Helpline[] = await helplinesRes.json();
                const ngosData: Ngo[] = await ngosRes.json();
                const legalResourcesData: LegalResource[] = await legalResourcesRes.json();

                // Add simple sequential IDs if not present in JSON (for key prop)
                setHelplines(helplinesData.map((item, index) => ({ ...item, id: item.id || index + 1 })));
                setNgos(ngosData.map((item, index) => ({ ...item, id: item.id || index + 1 })));
                setLegalResources(legalResourcesData.map((item, index) => ({ ...item, id: item.id || index + 1 })));

            } catch (err: any) {
                console.error("Client: Failed to fetch data from local JSON:", err);
                setError(`Failed to load resources: ${err.message}. Please check data files.`);
                setHelplines([]);
                setNgos([]);
                setLegalResources([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Filtering Logic (using the debounced search term) ---
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();

    const filterItems = <T extends { [key: string]: any }>(items: T[], fieldsToSearch: string[]): T[] => {
        if (!lowerCaseSearchTerm) return items; // Return all if search is empty

        return items.filter(item => {
            if (!item) return false;
            return fieldsToSearch.some(fieldKey => {
                let fieldValue = item[fieldKey];
                if (fieldKey === 'address' && 'city' in item) { // For NGOs
                    fieldValue = [item.address_line1, item.city, item.state, item.pincode].filter(Boolean).join(', ');
                }
                return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(lowerCaseSearchTerm);
            });
        });
    };

    const filteredHelplines = filterItems(helplines, ['name', 'number', 'description', 'scope', 'languages']);
    const filteredNgos = filterItems(ngos, ['name', 'description', 'services_offered', 'address', 'phone_number', 'email', 'website']);
    const filteredLegalResources = filterItems(legalResources, ['title', 'summary_of_law', 'relevant_sections', 'procedure_for_reporting']);

    // --- JSX Rendering (Mostly the same, but ensure fields match new simple interfaces) ---
    return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 text-gray-900 font-sans">
            {/* Decorative top border with Indian flag colors */}
            <div className="w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <header className="text-center mb-10 md:mb-12 relative">
                    <div className="hidden md:block absolute left-10 top-1/2 transform -translate-y-1/2 text-pink-400 opacity-20 text-6xl">✿</div>
                    <div className="hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2 text-pink-400 opacity-20 text-6xl">✿</div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-pink-800">JanaHub India</h1>
                    <div className="w-24 h-1 bg-orange-500 mx-auto my-4"></div>
                    <p className="mt-3 text-lg sm:text-xl text-pink-700 max-w-2xl mx-auto">
                        Find verified helplines, support NGOs, and essential legal information for womens safety.
                    </p>
                </header>

                {/* Search Input Section */}
                <div className="w-full max-w-xl mx-auto mb-8">
                    <div className="relative">
                        <label htmlFor="search-resources" className="sr-only">Search all resources</label>
                        <input
                            id="search-resources"
                            type="search"
                            placeholder="Search by name, location, service, law..."
                            className="w-full px-5 py-3 border-2 border-orange-300 rounded-full shadow-sm placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 transition duration-200 ease-in-out bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation Section */}
                <nav className="flex justify-center border-b border-orange-200 mb-10 md:mb-12" aria-label="Resource categories">
                    {/* Helplines Tab */}
                    <button onClick={() => setActiveTab('helplines')} className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${activeTab === 'helplines' ? 'border-pink-600 text-pink-700 font-semibold' : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`} aria-current={activeTab === 'helplines' ? 'page' : undefined}>Helplines</button>
                    {/* NGOs Tab */}
                    <button onClick={() => setActiveTab('ngos')} className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${activeTab === 'ngos' ? 'border-pink-600 text-pink-700 font-semibold' : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`} aria-current={activeTab === 'ngos' ? 'page' : undefined}>NGOs</button>
                    {/* Legal Info Tab */}
                    <button onClick={() => setActiveTab('legalResources')} className={`px-5 py-3 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${activeTab === 'legalResources' ? 'border-pink-600 text-pink-700 font-semibold' : 'border-transparent text-orange-700 hover:text-pink-600 hover:border-orange-300'}`} aria-current={activeTab === 'legalResources' ? 'page' : undefined}>Legal Info</button>
                </nav>

                {/* Loading State Display */}
                {isLoading && (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-4"></div>
                        <p className="text-lg text-pink-600">Loading resources...</p>
                    </div>
                )}

                {/* Error State Display */}
                {error && !isLoading && (
                    <div className="max-w-3xl mx-auto bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-10 rounded-r-lg shadow-sm" role="alert">
                        <p className="font-bold">Error Loading Data</p><p>{error}</p>
                    </div>
                )}

                {/* --- Main Content Area (Results) --- */}
                {!isLoading && !error && (
                    <div className="space-y-12 md:space-y-16">

                        {/* Helpline Section */}
                        {activeTab === 'helplines' && (
                            <section aria-labelledby="helpline-heading" className="transition-opacity duration-300 ease-in-out">
                                <h2 id="helpline-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
                                    <span className="bg-pink-100 text-pink-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></span>
                                    Helplines <span className="text-base font-normal text-orange-500 ml-2">({filteredHelplines.length})</span>
                                </h2>
                                {filteredHelplines.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredHelplines.map((helpline) => (
                                            <li key={helpline.id} className="bg-white p-5 rounded-lg shadow-md border border-orange-100 hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                                                <h3 className="text-lg font-semibold text-pink-700 mb-2 group-hover:text-pink-800 transition-colors duration-200">{helpline.name}</h3>
                                                <div className="space-y-2 text-sm text-gray-700 flex-grow">
                                                    <p className="flex items-center"><span className="inline-block bg-orange-100 p-1 rounded-full mr-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></span><a href={`tel:${helpline.number}`} className="text-pink-600 hover:text-pink-800 hover:underline break-words font-medium">{helpline.number}</a></p>
                                                    <p className="flex items-start"><span className="inline-block bg-orange-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg></span><span>{helpline.scope}</span></p>
                                                    <p className="flex items-start"><span className="inline-block bg-orange-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" /></svg></span><span>{helpline.languages}</span></p>
                                                    <p className="text-gray-600 pt-2 mt-2 text-xs italic border-t border-orange-100">{helpline.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No helplines match your search.' : 'No helplines found in this category.'}</p>
                                )}
                            </section>
                        )}

                        {/* NGO Section */}
                        {activeTab === 'ngos' && (
                            <section aria-labelledby="ngo-heading" className="transition-opacity duration-300 ease-in-out">
                                <h2 id="ngo-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
                                    <span className="bg-green-100 text-green-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg></span>
                                    NGOs <span className="text-base font-normal text-orange-500 ml-2">({filteredNgos.length})</span>
                                </h2>
                                {filteredNgos.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredNgos.map((ngo) => {
                                            const addressString = [ngo.address_line1, ngo.city, ngo.state, ngo.pincode].filter(Boolean).join(', ');
                                            return (
                                                <li key={ngo.id} className="bg-white p-5 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>
                                                    <h3 className="text-lg font-semibold text-green-700 mb-2 group-hover:text-green-800 transition-colors duration-200">{ngo.name}</h3>
                                                    <div className="space-y-2 text-sm text-gray-700 flex-grow">
                                                        {ngo.description && <p className="text-gray-600 pb-2 text-xs italic border-b border-green-100 mb-2">{ngo.description}</p>}
                                                        {ngo.services_offered && <p className="flex items-start"><span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span><span className="flex-1">{ngo.services_offered}</span></p>}
                                                        {addressString && <p className="flex items-start"><span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg></span><span className="flex-1">{addressString}</span></p>}
                                                        {ngo.phone_number && <p className="flex items-start"><span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></span><a href={`tel:${ngo.phone_number}`} className="text-green-600 hover:text-green-800 hover:underline break-words">{ngo.phone_number}</a></p>}
                                                        {ngo.email && <p className="flex items-start"><span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span><a href={`mailto:${ngo.email}`} className="text-green-600 hover:text-green-800 hover:underline break-all">{ngo.email}</a></p>}
                                                        {ngo.website && <p className="flex items-start"><span className="inline-block bg-green-100 p-1 rounded-full mr-2 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5a.5.5 0 00.707 0l3-3z" clipRule="evenodd" /><path fillRule="evenodd" d="M6.586 11.586a2 2 0 10-2.828 2.828l3 3a2 2 0 002.828 0l1.5-1.5a2 2 0 10-2.828-2.828l-1.5 1.5a.5.5 0 01-.707 0l-3-3z" clipRule="evenodd" /></svg></span><a href={!ngo.website?.startsWith('http') ? `http://${ngo.website}` : ngo.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 hover:underline break-all">{ngo.website}</a></p>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No NGOs match your search.' : 'No NGOs found in this category.'}</p>
                                )}
                            </section>
                        )}

                        {/* Legal Resources Section */}
                        {activeTab === 'legalResources' && (
                            <section aria-labelledby="legal-heading" className="transition-opacity duration-300 ease-in-out">
                                <h2 id="legal-heading" className="text-2xl font-semibold mb-5 text-pink-800 border-b pb-2 border-orange-200 flex items-center">
                                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2 flex items-center justify-center w-8 h-8"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.053 2.28a1 1 0 011.894 0l1.405 3.575a1 1 0 00.95.69h3.74a1 1 0 01.7 1.7l-2.829 2.05a1 1 0 00-.364 1.118l1.07 3.39a1 1 0 01-1.54 1.144l-2.89-2.1a1 1 0 00-1.175 0l-2.89 2.1a1 1 0 01-1.54-1.144l1.07-3.39a1 1 0 00-.364-1.118L2.67 8.245a1 1 0 01.7-1.7h3.74a1 1 0 00.95-.69L9.46 2.28zM10 16a6 6 0 100-12 6 6 0 000 12z" /><path d="M10 9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" /></svg></span>
                                    Legal Information <span className="text-base font-normal text-orange-500 ml-2">({filteredLegalResources.length})</span>
                                </h2>
                                {filteredLegalResources.length > 0 ? (
                                    <ul className="space-y-6">
                                        {filteredLegalResources.map((resource) => (
                                            <li key={resource.id} className="bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-all duration-200 ease-in-out relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                                                <h3 className="text-xl font-semibold text-purple-700 mb-4 group-hover:text-purple-800 transition-colors duration-200">{resource.title}</h3>
                                                <div className="space-y-5 text-gray-700 leading-relaxed text-sm">
                                                    {resource.summary_of_law && <div><strong className="font-medium text-purple-600 block mb-1 text-base flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6a1 1 0 11-2 0V4zm4 11a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" /></svg>Summary:</strong><p className="pl-6">{resource.summary_of_law}</p></div>}
                                                    {resource.relevant_sections && <div><strong className="font-medium text-purple-600 block mb-1 text-base flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>Relevant Sections:</strong><p className="pl-6 whitespace-pre-wrap">{resource.relevant_sections}</p></div>}
                                                    {resource.procedure_for_reporting && <div><strong className="font-medium text-purple-600 block mb-1 text-base flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>Reporting Procedure:</strong><p className="pl-6 whitespace-pre-wrap">{resource.procedure_for_reporting}</p></div>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 py-6 italic">{debouncedSearchTerm ? 'No legal information matches your search.' : 'No legal information found in this category.'}</p>
                                )}
                            </section>
                        )}

                        {/* No Search Results Message */}
                        {debouncedSearchTerm &&
                            filteredHelplines.length === 0 &&
                            filteredNgos.length === 0 &&
                            filteredLegalResources.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-xl text-gray-500">
                                        No results found for <span className="font-semibold text-pink-700">{debouncedSearchTerm}</span>.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-3">Try searching for a different term, check spelling, or select another category.</p>
                                </div>
                        )}

                        {/* Initial Empty State Message for Active Tab */}
                        {!debouncedSearchTerm && !isLoading && !error && (
                            (activeTab === 'helplines' && helplines.length === 0 && filteredHelplines.length === 0) ||
                            (activeTab === 'ngos' && ngos.length === 0 && filteredNgos.length === 0) ||
                            (activeTab === 'legalResources' && legalResources.length === 0 && filteredLegalResources.length === 0)
                        ) && (
                            <div className="text-center py-16">
                                <p className="text-lg text-gray-500">
                                    There are currently no resources listed in the {
                                        activeTab === 'helplines' ? 'Helplines' :
                                        activeTab === 'ngos' ? 'NGOs' : 'Legal Info'
                                    } category.
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Please check back later or try another category.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Section */}
                <footer className="text-center mt-16 pt-8 border-t border-orange-200 text-orange-700 text-sm">
                    JanaHub India | Made with hope | © {new Date().getFullYear()}
                </footer>
            </div>
        </main>
    );
}