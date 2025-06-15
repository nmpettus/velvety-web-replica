// Use a simpler, public domain KJV API
const API_BASE_URL = 'https://bible-api.com';

// Helper function to clean and validate verse references
function normalizeReference(reference: string): string {
  // First, try to extract a valid verse reference from the input string
  // This regex looks for book names followed by chapter:verse patterns
  const extractPattern = /\b([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(\d+))?\b/;
  const match = reference.match(extractPattern);
  
  if (match) {
    // Reconstruct the reference from the matched parts
    const book = match[1].trim();
    const chapter = match[2];
    const startVerse = match[3];
    const endVerse = match[4];
    
    let normalized = `${book} ${chapter}:${startVerse}`;
    if (endVerse) {
      normalized += `-${endVerse}`;
    }
    
    return normalized;
  }
  
  // If no match found, try to clean up the original reference
  let normalized = reference
    .replace(/\b(niv|kjv|nasb|nlt|esv)\b/gi, '')  // Remove translation markers
    .replace(/\s+/g, ' ')                          // Normalize spaces
    .replace(/(\d+)[:.]\s*(\d+)/g, '$1:$2')       // Standardize chapter:verse format
    .replace(/(\d+)\s+(\d+)/g, '$1:$2')           // Convert "chapter verse" to "chapter:verse"
    .trim();

  // Try the extraction pattern again on the cleaned string
  const secondMatch = normalized.match(extractPattern);
  if (secondMatch) {
    const book = secondMatch[1].trim();
    const chapter = secondMatch[2];
    const startVerse = secondMatch[3];
    const endVerse = secondMatch[4];
    
    let result = `${book} ${chapter}:${startVerse}`;
    if (endVerse) {
      result += `-${endVerse}`;
    }
    
    return result;
  }

  // If still no valid reference found, throw an error
  throw new Error(
    'Invalid verse reference format.\n' +
    'Please use one of these formats:\n' +
    '- Single verse: "John 3:16"\n' +
    '- Verse range: "Romans 8:28-29"\n' +
    '- Multiple verses: "Psalm 23:1-6"'
  );
}

export async function getVerseContent(reference: string): Promise<string> {
  try {
    // Normalize and validate the reference
    const normalizedRef = normalizeReference(reference);
    
    // Encode the reference for the URL
    const encodedRef = encodeURIComponent(normalizedRef);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/${encodedRef}?translation=kjv`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verse (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error('Verse content not found');
    }

    // Clean up the verse text
    const cleanContent = data.text
      .replace(/\s+/g, ' ')    // Normalize spaces
      .replace(/^\s+|\s+$/g, '') // Trim start and end
      .replace(/\n/g, ' ');    // Remove newlines
    
    return cleanContent;
  } catch (error) {
    console.error('Error fetching verse:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load the verse');
  }
}