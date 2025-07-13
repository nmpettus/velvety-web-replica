import OpenAI from 'openai';

const getApiKey = () => {
  // Try to get from environment first
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey) return envKey;
  
  // Fallback to window.ENV
  return (window as any).ENV?.VITE_OPENAI_API_KEY;
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true
});

// Verified book links that we know exist
const VERIFIED_BOOKS = {
  'Jesus Storybook Bible': 'https://www.amazon.com/Jesus-Storybook-Bible-Every-Whispers/dp/0310708257',
  'The Beginner\'s Bible': 'https://www.amazon.com/Beginners-Bible-Timeless-Childrens-Stories/dp/0310750199',
  'The Illustrated Children\'s Bible': 'https://www.amazon.com/dp/0755498383',
  'Big Picture Story Bible': 'https://www.amazon.com/Big-Picture-Story-Bible/dp/1433542579',
  'The Action Bible': 'https://www.amazon.com/Action-Bible-Gods-Redemptive-Unfolds/dp/0781444993',
  'My First Bible': 'https://www.amazon.com/First-Bible-Kenneth-Taylor/dp/0842321810',
  'Read and Share Bible': 'https://www.amazon.com/Read-Share-Bible-Gwen-Ellis/dp/1400308410',
  'Spark Story Bible': 'https://www.amazon.com/Spark-Story-Bible-Deborah-ONeill/dp/0806656077',
  'God\'s Little Princess Devotional Bible': 'https://www.amazon.com/Gods-Little-Princess-Devotional-Bible/dp/1400316774'
};

// Verified article sources
const VERIFIED_SOURCES = [
  'https://www.gotquestions.org',
  'https://www.biblestudytools.com',
  'https://www.blueletterbible.org',
  'https://www.studylight.org',
  'https://www.preceptaustin.org',
  'https://www.biblehub.com',
  'https://www.ligonier.org',
  'https://www.desiringgod.org',
  'https://www.monergism.com',
  'https://www.thegospelcoalition.org',
  'https://www.gty.org'
];

// Verified sermon and teaching resources
const VERIFIED_SERMONS = {
  'Charles Spurgeon': 'https://www.spurgeon.org/resource-library/sermons',
  'Martyn Lloyd-Jones': 'https://www.mljtrust.org/sermons',
  'John MacArthur': 'https://www.gty.org/library/sermons-library',
  'John Piper': 'https://www.desiringgod.org/messages',
  'R.C. Sproul': 'https://www.ligonier.org/learn/sermons'
};

// Verified devotional sources
const VERIFIED_DEVOTIONALS = {
  'Grace Gems': 'https://www.gracegems.org',
  'Spurgeon Daily': 'https://www.spurgeon.org/resource-library/daily-readings',
  'Blue Letter Bible Devotionals': 'https://www.blueletterbible.org/devotionals'
};

// Verified commentary sources
const VERIFIED_COMMENTARIES = {
  'Matthew Henry': 'https://www.biblestudytools.com/commentaries/matthew-henry-complete',
  'John MacArthur': 'https://www.biblestudytools.com/commentaries/macarthur-new-testament-commentary',
  'John Gill': 'https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible',
  'Albert Barnes': 'https://www.biblestudytools.com/commentaries/barnes-notes-on-the-new-testament',
  'Charles Spurgeon': 'https://www.spurgeon.org/resource-library/commentaries'
};

const SYSTEM_PROMPT = `You are a grace-based new covenant teacher who emphasizes the finished work of Christ, complete forgiveness, and our identity in Christ. You MUST provide citations for every interpretation.

IMPORTANT: Write ALL answers using simple language that 5-12 year old children can easily understand. Use:
- Short, simple sentences
- Common everyday words (avoid big theological terms)
- Fun examples and comparisons kids can relate to
- Encouraging, loving tone
- Explain difficult concepts like you're talking to a child

GOSPEL FOCUS: In every response, gently and lovingly point toward the good news of Jesus in a way that feels natural and encouraging, not pushy. Help people understand:
- Jesus loves them so much and wants to be their friend forever
- Jesus took care of all their mistakes so they can be close to God
- They can talk to Jesus anytime and He always listens
- God has wonderful plans for their life
- The best thing anyone can do is believe that Jesus loves them and wants to help them
- Make it sound exciting and wonderful to know Jesus personally
Always do this in a warm, inviting way that makes people feel loved, never scared or pressured.

Your response MUST be a valid JSON object with this structure:
{
   "text": "Your main answer text here (written for kids ages 5-12)",
   "references": [
     {
       "type": "verse" | "book" | "commentary" | "article" | "sermon" | "devotional",
       "title": "Reference title",
       "link": "Valid URL",
       "description": "Optional description"
     }
   ]
 }
 
IMPORTANT: For book references, ONLY use these verified titles:
${Object.keys(VERIFIED_BOOKS).map(title => `- ${title}`).join('\n')}

When recommending books, always add a note that children should ask their parents or guardians before looking at any book links, and explain that these are special Bible books made just for kids.
For articles, ONLY use content from these verified sources:
${VERIFIED_SOURCES.map(source => `- ${source}`).join('\n')}

When answering questions about the Bible, Christianity, or theology:
1. Use simple words and short sentences that kids can understand
2. Emphasize how much God loves them and that Jesus took care of all their mistakes
3. Use examples from everyday life that kids know (like family, friends, school, pets)
4. Make it sound exciting and wonderful, not scary or confusing
5. Focus on God's love, forgiveness, and how special each child is to God
6. Avoid big words like "righteousness," "covenant," "theology" - use "being good with God," "promise," "learning about God" instead
7. Use Bible Gateway for verses (https://www.biblegateway.com/passage/?search=)
8. Only reference grace-focused teachers and sources such as:
   - John MacArthur (https://www.gty.org)
   - John Piper (https://www.desiringgod.org)
   - R.C. Sproul (https://www.ligonier.org)
   - Charles Spurgeon (https://www.spurgeon.org)
   - Got Questions (https://www.gotquestions.org)
   - Bible Study Tools (https://www.biblestudytools.com)
   - Blue Letter Bible (https://www.blueletterbible.org)
   - The Gospel Coalition (https://www.thegospelcoalition.org)

9. Include diverse reference types but make sure they're appropriate for families with children
10. Maintain a pure grace, new covenant perspective that emphasizes in kid-friendly terms:
   - God forgives all our mistakes because of Jesus
   - God loves us no matter what
   - We don't have to be perfect - Jesus was perfect for us
   - God sees us as His special children
   - We can talk to God anytime because He loves us
11. Keep responses warm, encouraging, and age-appropriate
12. Every answer should help kids feel loved by God and excited about their faith`;

export interface AIResponse {
  text: string;
  references: {
    type: 'verse' | 'book' | 'commentary' | 'article';
    title: string;
    link: string;
    description?: string;
  }[];
}

export async function getAnswer(question: string): Promise<AIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + "\n\nIMPORTANT: Format your entire response as a single JSON object with 'text' and 'references' fields. Do not include any additional text or formatting."
        },
        { role: "user", content: question }
      ]
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response received. Please try your question again.');
    }
    
    // Check if response is non-JSON (plain text error message)
    const trimmedResponse = response.trim();
    if (trimmedResponse && !trimmedResponse.startsWith('{')) {
      throw new Error(`AI message: ${trimmedResponse}`);
    }
    
    let parsedResponse;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response
        .trim()
        // Remove any non-JSON text before or after the JSON object
        .replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1')
        // Remove code block markers
        .replace(/```json\s*|\s*```/g, '')
        // Remove control characters
        .replace(/[\u0000-\u001F]+/g, ' ')
        .trim();
      
      try {
        parsedResponse = JSON.parse(cleanedResponse);
      } catch (jsonError) {
        // If parsing fails, try to fix common JSON issues
        let fixedJson = cleanedResponse
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Quote unquoted keys
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']');  // Remove trailing commas in arrays
        
        // Ensure the text is properly escaped
        if (fixedJson.includes('"text":')) {
          fixedJson = fixedJson.replace(/"text":\s*"([^"]*)"/, (match, p1) => 
            `"text":"${p1.replace(/"/g, '\\"')}"`
          );
        }
        
        parsedResponse = JSON.parse(fixedJson);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, '\nResponse:', response);
      throw new Error('The AI provided an invalid response format. Please try again.');
    }
    
    if (!isValidResponse(parsedResponse)) {
      const issues = validateResponseIssues(parsedResponse);
      if (issues.length > 0) {
        // Instead of throwing, try to fix the response
        if (typeof parsedResponse.text === 'string' && Array.isArray(parsedResponse.references)) {
          // Filter out invalid references
          parsedResponse.references = parsedResponse.references.filter(ref => {
            if (!ref || typeof ref !== 'object') return false;
            return (
              ['verse', 'book', 'commentary', 'article', 'sermon', 'devotional'].includes(ref.type) &&
              typeof ref.title === 'string' &&
              typeof ref.link === 'string'
            );
          });
          
          // If we still have a valid response after filtering, use it
          if (parsedResponse.text && parsedResponse.references.length > 0) {
            console.log('Fixed response validation issues');
          } else {
            throw new Error('Could not process the response. Please try rephrasing your question.');
          }
        } else {
          throw new Error('Invalid response format. Please try again.');
        }
      }
    }
    
    // Validate and fix references
    parsedResponse.references = parsedResponse.references.map(ref => {
      // Create a backup of the original reference
      const originalRef = { ...ref };
      
      switch (ref.type) {
      case 'book':
        // Find matching book title and use verified link
        const bookTitle = Object.keys(VERIFIED_BOOKS).find(title => 
          ref.title.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(ref.title.toLowerCase())
        );
        if (bookTitle) {
          ref = {
            ...ref,
            title: bookTitle,
            link: VERIFIED_BOOKS[bookTitle],
            description: `A wonderful Bible book for kids! Ask your parent or guardian to help you with this link. ${ref.description || ''}`
          };
        } else {
          // If no exact match, use a default grace-focused book
          ref = {
            ...ref,
            title: 'Jesus Storybook Bible',
            link: VERIFIED_BOOKS['Jesus Storybook Bible'],
            description: `A wonderful Bible book for kids! Ask your parent or guardian to help you with this link. Alternative reference for: "${originalRef.title}". ${ref.description || ''}`
          };
        }
        break;

      case 'article':
        // Verify article source is from approved list
        const isValidSource = VERIFIED_SOURCES.some(source => 
          ref.link.toLowerCase().startsWith(source.toLowerCase())
        );
        if (!isValidSource && ref.link) {
          // Try to find a matching verified source or use a default
          const matchingSource = VERIFIED_SOURCES.find(source => {
            const sourceName = source.split('/').pop()?.toLowerCase() || '';
            return ref.title.toLowerCase().includes(sourceName) ||
                   sourceName.includes(ref.title.toLowerCase());
          }) || 'https://www.gotquestions.org';
          
          // Update reference with valid source
          ref = {
            ...ref,
            link: `${matchingSource}/search?q=${encodeURIComponent(ref.title)}`,
            description: `Alternative source for: "${originalRef.title}". ${ref.description || ''}`
          };
        }
        break;

      case 'sermon':
        const teacherName = Object.keys(VERIFIED_SERMONS).find(name =>
          ref.title.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(ref.title.toLowerCase())
        );
        // Create a search-friendly query from the sermon title
        const searchQuery = encodeURIComponent(
          ref.title.replace(/sermon|teaching|message/gi, '').trim()
        );
        
        if (teacherName) {
          // Build a search URL for the specific teacher's content
          const baseUrl = VERIFIED_SERMONS[teacherName];
          const searchUrl = baseUrl.includes('?') 
            ? `${baseUrl}&q=${searchQuery}`
            : `${baseUrl}?q=${searchQuery}`;
            
          ref = {
            ...ref,
            link: searchUrl,
            description: `Sermon by ${teacherName}. ${ref.description || ''}`
          };
        } else {
          // Use Grace to You's sermon search as default
          const gtySearchUrl = `https://www.gty.org/library/sermons-library/scripture/all?q=${searchQuery}`;
          ref = {
            ...ref,
            link: gtySearchUrl,
            description: `Alternative sermon resource for: "${originalRef.title}". ${ref.description || ''}`
          };
        }
        break;

      case 'devotional':
        const devotionalName = Object.keys(VERIFIED_DEVOTIONALS).find(name =>
          ref.title.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(ref.title.toLowerCase())
        );
        if (devotionalName) {
          ref = {
            ...ref,
            link: VERIFIED_DEVOTIONALS[devotionalName],
            description: `From ${devotionalName}. ${ref.description || ''}`
          };
        } else {
          // Default to Grace Gems
          ref = {
            ...ref,
            link: VERIFIED_DEVOTIONALS['Grace Gems'],
            description: `Alternative devotional for: "${originalRef.title}". ${ref.description || ''}`
          };
        }
        break;

      case 'commentary':
        const commentaryAuthor = Object.keys(VERIFIED_COMMENTARIES).find(name =>
          ref.title.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(ref.title.toLowerCase())
        );
        if (commentaryAuthor) {
          ref = {
            ...ref,
            link: VERIFIED_COMMENTARIES[commentaryAuthor],
            description: `Commentary by ${commentaryAuthor}. ${ref.description || ''}`
          };
        } else {
          // Default to Matthew Henry's commentary
          ref = {
            ...ref,
            link: VERIFIED_COMMENTARIES['Matthew Henry'],
            description: `Alternative commentary source for: "${originalRef.title}". ${ref.description || ''}`
          };
        }
        break;
      }

      // Ensure we always have a valid link
      if (!ref.link || !isValidUrl(ref.link)) {
        ref.link = 'https://www.gotquestions.org';
        ref.description = `Original source unavailable. ${ref.description || ''}`;
      }

      return ref;
    }).filter(ref => ref.link && isValidUrl(ref.link));

    // Final validation before returning
    if (!parsedResponse.text || !parsedResponse.references.length) {
      throw new Error('Could not generate a complete answer. Please try rephrasing your question.');
    }

    return parsedResponse;

  } catch (error) {
    console.error('Error getting answer:', error);
    
    // Re-throw AI message errors directly to show the AI's actual response
    if (error instanceof Error && error.message.startsWith('AI message:')) {
      throw error;
    }
    
    throw new Error(
      error instanceof Error
        ? `${error.message}`
        : 'Something went wrong. Please try asking your question again.'
    );
  }
}

function validateResponseIssues(response: any): string[] {
  const issues: string[] = [];
  
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    issues.push('Response must be an object');
    return issues;
  }

  if (typeof response.text !== 'string' || !response.text.trim()) {
    issues.push('Missing or invalid text field');
  }

  if (!Array.isArray(response.references)) {
    issues.push('Missing or invalid references array');
    return issues;
  }

  response.references.forEach((ref: any, index: number) => {
    if (!ref || typeof ref !== 'object' || Array.isArray(ref)) {
      issues.push(`Invalid reference object at index ${index}`);
      return;
    }

    const validTypes = ['verse', 'book', 'commentary', 'article', 'sermon', 'devotional'];
    if (!ref.type || !validTypes.includes(ref.type)) {
      issues.push(`Invalid reference type at index ${index}: ${ref.type}`);
    }

    if (typeof ref.title !== 'string' || !ref.title.trim()) {
      issues.push(`Missing title at index ${index}`);
    }

    if (typeof ref.link !== 'string' || !ref.link.trim() || !isValidUrl(ref.link)) {
      issues.push(`Missing link at index ${index}`);
    }

    if (ref.description !== undefined && (typeof ref.description !== 'string' || !ref.description.trim())) {
      issues.push(`Invalid description at index ${index}`);
    }
  });

  return issues;
}

function isValidResponse(response: any): response is AIResponse {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return false;
  }

  if (typeof response.text !== 'string' || !response.text.trim() || !Array.isArray(response.references)) {
    return false;
  }

  return response.references.every((ref: any) => {
    if (!ref || typeof ref !== 'object' || Array.isArray(ref)) {
      return false;
    }
    
    const validTypes = ['verse', 'book', 'commentary', 'article', 'sermon', 'devotional'];
    
    return (
      validTypes.includes(ref.type) &&
      typeof ref.title === 'string' &&
      ref.title.trim() !== '' &&
      typeof ref.link === 'string' &&
      ref.link.trim() !== '' &&
      isValidUrl(ref.link) &&
      (ref.description === undefined || (typeof ref.description === 'string' && ref.description.trim() !== ''))
    );
  });
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}