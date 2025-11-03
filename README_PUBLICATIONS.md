# Publications Excel File Setup

This website loads **all academic content** (Publications, Preprints, Talks) dynamically from a single Excel file (`publications.xlsx`) with multiple sheets. This makes it easy to update your content without editing HTML.

## Excel File Structure

The `publications.xlsx` file contains **three sheets**:

### 📄 Publications Sheet
For peer-reviewed publications.

**Columns:**
- **Year**: Publication year (e.g., "2025")
- **Venue**: Conference/journal name (e.g., "Eurocrypt", "ICLR")
- **Title**: Publication title
- **Link**: URL to the publication (full URL)
- **Authors**: Author list (your name will be automatically bolded if it contains "Mingxun Zhou")
- **Note**: Optional note (e.g., "(Randomized Author Order)", "(*Equal Contribution)")
- **CodeLink**: Optional link to code repository (leave empty if none)

**Example:**
| Year | Venue | Title | Link | Authors | Note | CodeLink |
|------|-------|-------|------|---------|------|----------|
| 2025 | Eurocrypt | Pseudorandom Functions... | https://... | Ashrujit Ghoshal, Mingxun Zhou, ... | (Randomized Author Order) | |

### 📄 Preprints Sheet
For preprints, theses, and other projects.

**Columns:**
- **Title**: Publication title
- **Link**: URL (or leave empty)
- **Authors**: Author list (your name will be automatically bolded)
- **Year**: Year (e.g., "2025")
- **Note**: Optional note (e.g., "PhD Thesis", "Bachelor Thesis")
- **Type**: Optional type field

**Example:**
| Title | Link | Authors | Year | Note | Type |
|-------|------|---------|------|------|------|
| Private Information Retrieval... | https://... | | 2025 | PhD Thesis | |

### 📄 Talks Sheet
For presentations and talks.

**Columns:**
- **Title**: Talk title
- **Venue**: Where the talk was given (e.g., "ITCS", "CMU Crypto Seminar")
- **Date**: Date of the talk (e.g., "Jan. 2024", "Jul. 2023")
- **VideoLink**: Link to video recording (if available)

**Example:**
| Title | Venue | Date | VideoLink |
|-------|-------|------|-----------|
| Advanced Composition Theorems... | ITCS | Jan. 2024 | https://youtube.com/... |

## Initial Setup

### Option 1: Use the Python Script (Recommended)

1. Install the required library:
   ```bash
   pip install openpyxl
   ```

2. Run the generation script:
   ```bash
   python3 generate_publications_excel.py
   ```

3. This will create `publications.xlsx` with all three sheets and your current content.

### Option 2: Create Manually

1. Create a new Excel file named `publications.xlsx`
2. Create three sheets named exactly: **Publications**, **Preprints**, **Talks**
3. Add the column headers as listed above in each sheet
4. Add your data row by row

## Updating Content

Simply edit `publications.xlsx`:
- Add new rows for new entries
- Edit existing rows to update information
- Delete rows to remove entries
- Commit the changes to your repository

The website will automatically load the updated content when you refresh the page.

## Tips

### Author Names
- For Publications and Preprints: Write "Mingxun Zhou" normally - it will be automatically bolded
- Or use `<strong>Mingxun Zhou</strong>` if you want manual control

### Sorting
- Publications are sorted by year (newest first), then by venue
- Preprints are sorted by year (newest first), then by title
- Talks are sorted by date (newest first)

### Links
- Always use full URLs starting with `http://` or `https://`
- Leave empty if no link is available
- For talks, use VideoLink for the video recording URL

### Notes
- Use the Note column for special annotations like "(Randomized Author Order)" or "PhD Thesis"
- Leave empty if not needed

## Testing Locally

When testing locally, make sure `publications.xlsx` is in the same directory as `index.html`. 

**Important**: Use a local web server (not opening the file directly) due to CORS restrictions. See `README_LOCAL_DEVELOPMENT.md` for instructions.

## Troubleshooting

- **Content doesn't load**: Check the browser console for errors
- **Wrong sheet names**: Sheet names must be exactly "Publications", "Preprints", and "Talks" (case-sensitive)
- **Missing columns**: Ensure all required column headers are present in the first row
- **No data showing**: Check that rows have data (not just headers)

## File Structure

```
publications.xlsx
├── Publications sheet (12+ rows)
├── Preprints sheet (4+ rows)
└── Talks sheet (8+ rows)
```

All three sections will load automatically from the Excel file when you open the website!
