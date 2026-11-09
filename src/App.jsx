import React, { useState, useEffect } from 'react';

export default function App() {
  // Active sub-topic and Full-Screen Zoom states
  const [selectedSubTopic, setSelectedSubTopic] = useState('10th');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Load saved documents from browser localStorage
  const [vaultDocs, setVaultDocs] = useState(() => {
    const savedData = localStorage.getItem('docsafe_vault_v1');
    return savedData ? JSON.parse(savedData) : {};
  });

  // Automatically save documents whenever vaultDocs updates
  useEffect(() => {
    try {
      localStorage.setItem('docsafe_vault_v1', JSON.stringify(vaultDocs));
    } catch (error) {
      alert("Storage is full! Please remove some old documents.");
    }
  }, [vaultDocs]);

  // Categories and Nested Sub-Topics
  const categories = [
    {
      name: 'Academic Vault',
      icon: '📂',
      items: [
        { id: '10th', title: '10th Class Marksheet', desc: 'Permanent board certificate' },
        { id: '12th', title: '12th Class Marksheet', desc: 'Higher secondary certificate' },
        { id: 'degree', title: 'Higher Education', desc: 'College marksheets & graduation degrees' },
        { id: 'competitive', title: 'Competitive Exams', desc: 'Official rank cards & admit cards' }
      ]
    },
    {
      name: 'Legal & Financial',
      icon: '💼',
      items: [
        { id: 'national-id', title: 'National IDs (Aadhar, PAN)', desc: 'Aadhar, PAN, Driving License, Passport' },
        { id: 'finance', title: 'Financial Records (ITR)', desc: 'ITR acknowledgements & Form 16' },
        { id: 'property', title: 'Property & Vehicle Deeds', desc: 'Vehicle RC, Insurance, Registry papers' },
        { id: 'employment', title: 'Employment Contracts', desc: 'Offer letters & experience certificates' }
      ]
    }
  ];

  // Find active sub-topic details
  const allItems = categories.flatMap(cat => cat.items);
  const currentDocInfo = allItems.find(item => item.id === selectedSubTopic);

  // HTML5 Canvas Image Compressor
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        callback(compressedBase64);
      };
    };
  };

  // Capture photo, compress, and store in state
  const handlePhotoCapture = (topicId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    compressImage(file, (compressedBase64) => {
      setVaultDocs(prev => ({
        ...prev,
        [topicId]: compressedBase64
      }));
    });
  };

  // Remove photo from vault
  const handleRemovePhoto = (topicId) => {
    if (window.confirm("Do you want to remove this document from the vault?")) {
      setVaultDocs(prev => {
        const updated = { ...prev };
        delete updated[topicId];
        return updated;
      });
      setIsZoomOpen(false);
    }
  };

  const hasPhoto = !!vaultDocs[selectedSubTopic];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2B3B20' }}>
      
      {/* Top Navbar */}
      <header style={{ height: '65px', padding: '0 32px', borderBottom: '1px solid #EAE8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#2B3B20', letterSpacing: '-0.5px' }}>DocSafe</span>
        </div>
        <div style={{ fontSize: '13px', color: '#4A5D3B', backgroundColor: '#E2ECD5', padding: '6px 16px', borderRadius: '20px', fontWeight: '600' }}>
          🔒 Secure Local Vault
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Sidebar with Nested Sub-Topics */}
        <aside style={{ width: '280px', padding: '24px 16px', borderRight: '1px solid #EAE8E2', backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
          {categories.map((category) => (
            <div key={category.name} style={{ marginBottom: '24px' }}>
              <div style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700', color: '#4A5D3B', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                {category.items.map((item) => {
                  const isActive = selectedSubTopic === item.id;
                  const isUploaded = !!vaultDocs[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSubTopic(item.id)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: isActive ? '600' : '500',
                        backgroundColor: isActive ? '#E2ECD5' : 'transparent',
                        color: isActive ? '#2B3B20' : '#6B7A5F',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{item.title}</span>
                      {isUploaded && <span style={{ fontSize: '12px' }}>✅</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Right Center Workspace */}
        <main style={{ flex: 1, backgroundColor: '#FAF9F6', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '500px', borderRadius: '28px', padding: '32px', boxShadow: '0 12px 32px rgba(0,0,0,0.04)', border: '1px solid #EAE8E2', textAlign: 'center' }}>
            
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2B3B20', marginBottom: '6px' }}>
              {currentDocInfo?.title}
            </h2>
            <p style={{ fontSize: '14px', color: '#7A8A6F', marginBottom: '24px' }}>
              {currentDocInfo?.desc}
            </p>

            {/* Upload / Preview Box */}
            {hasPhoto ? (
              <div style={{ position: 'relative', width: '100%', height: '260px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #C5D7B7', marginBottom: '20px' }}>
                <img 
                  src={vaultDocs[selectedSubTopic]} 
                  alt={currentDocInfo?.title} 
                  onClick={() => { setZoomScale(1); setIsZoomOpen(true); }}
                  title="Click to view full screen & zoom"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#FAF9F6', cursor: 'zoom-in' }}
                />
                <button 
                  onClick={() => { setZoomScale(1); setIsZoomOpen(true); }}
                  style={{
                    position: 'absolute', bottom: '12px', left: '12px', backgroundColor: '#E2ECD5', color: '#2B3B20', border: '1px solid #C5D7B7', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                  }}
                >
                  🔍 Zoom View
                </button>
                <button 
                  onClick={() => handleRemovePhoto(selectedSubTopic)}
                  style={{
                    position: 'absolute', top: '12px', right: '12px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            ) : (
              <label 
                style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '20px',
                  border: '2px dashed #C5D7B7',
                  backgroundColor: '#E2ECD5',
                  color: '#2B3B20',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '40px' }}>📸</span>
                <span style={{ fontSize: '16px', fontWeight: '700' }}>Click / Put Photo</span>
                <span style={{ fontSize: '12px', color: '#4A5D3B' }}>Tap to open camera or select from device</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => handlePhotoCapture(selectedSubTopic, e)}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {/* Status Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #EAE8E2', fontSize: '13px', color: '#6B7A5F' }}>
              <span>
                Document Status: <strong style={{ color: hasPhoto ? '#2B3B20' : '#8A9A7F' }}>{hasPhoto ? 'Saved & Secured' : 'Awaiting Upload'}</strong>
              </span>
              <span>Auto-Compressed</span>
            </div>

          </div>
        </main>

      </div>

      {/* Full-Screen Gallery Zoom Modal */}
      {isZoomOpen && hasPhoto && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(250, 249, 246, 0.96)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '24px'
          }}
        >
          {/* Top Bar inside Zoom View */}
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '12px 24px', borderRadius: '20px', border: '1px solid #EAE8E2', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <span style={{ fontWeight: '700', color: '#2B3B20', fontSize: '16px' }}>{currentDocInfo?.title}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href={vaultDocs[selectedSubTopic]} 
                download={`${currentDocInfo?.title || 'document'}.jpg`}
                style={{ backgroundColor: '#FAF9F6', color: '#2B3B20', border: '1px solid #C5D7B7', borderRadius: '14px', padding: '8px 16px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}
              >
                ⬇️ Download
              </a>
              <button 
                onClick={() => setIsZoomOpen(false)}
                style={{ backgroundColor: '#E2ECD5', color: '#2B3B20', border: 'none', borderRadius: '14px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Zoomable Image Canvas */}
          <div style={{ flex: 1, width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}>
            <img 
              src={vaultDocs[selectedSubTopic]} 
              alt={currentDocInfo?.title} 
              style={{
                maxWidth: '90%', maxHeight: '75vh', objectFit: 'contain',
                transform: `scale(${zoomScale})`, transformOrigin: 'center center',
                transition: 'transform 0.2s ease', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
            />
          </div>

          {/* Bottom Gallery Zoom Controls */}
          <div style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', padding: '10px 20px', borderRadius: '24px', border: '1px solid #EAE8E2', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <button 
              onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
              style={{ backgroundColor: '#FAF9F6', color: '#2B3B20', border: '1px solid #C5D7B7', borderRadius: '12px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
            >
              ➖ Zoom Out
            </button>
            <button 
              onClick={() => setZoomScale(1)}
              style={{ backgroundColor: '#E2ECD5', color: '#2B3B20', border: 'none', borderRadius: '12px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
            >
              Reset ({Math.round(zoomScale * 100)}%)
            </button>
            <button 
              onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
              style={{ backgroundColor: '#FAF9F6', color: '#2B3B20', border: '1px solid #C5D7B7', borderRadius: '12px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
            >
              ➕ Zoom In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
