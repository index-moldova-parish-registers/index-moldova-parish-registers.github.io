# Field dictionary

Three views of the same index, generated from the same source as the search
page. Same content, different shapes: pick `index.jsonl` to read a whole
file at once, `lignes.csv` to grep for a village, `dossiers.csv` for an
overview of the archival files.

Source: National Archives of the Republic of Moldova (ANRM), **fond 211**
-- the parish registers (*metricheskie knigi*, Russian *метрические книги*:
births, marriages, deaths) of Bessarabia, 1810-1931. Microfilmed by
FamilySearch as *Moldova, Church Books, 1811-1936*.

Licence: CC0 (public domain). No attribution required.

## The one thing to know before using this

**A folio is not an image.** The inventory locates a village by *folio*
(`folios`, the number of the leaf in the original book). The FamilySearch
viewer counts *images*, and an image usually shows a double page, so there
is no formula from one to the other. A village's `view` is the image where
its first page was located on the film; it is accurate to a few images.
Open it, read the folio number written on the page, then go forward or back.

Lines that have no `view` deliberately have no direct link to the village:
they only have the `file_start_url` of their file in `dossiers.csv` (the start
of the file, or the list of files on the reel).

## Cote

A file is cited `211-<inventory>/<file>`, for example `211-14/33`: fond 211,
inventory (*opis*) 14, file (*delo*) 33. Cite the archive as
`ANRM F.211 inv.14 d.33`. The inventory number tells the uezd (district).

## dossiers.csv -- one archival file per row

| field | meaning |
|---|---|
| `inventory`, `file` | inventory (*opis*) number and file number inside fond 211. `file` is text: some are `12a` |
| `cote` | `211-<inventory>/<file>` |
| `uezd` | district of the period the inventory belongs to; empty when we have not assigned it |
| `year_from`, `year_to` | years the file covers, empty when the inventory gives none |
| `lines` | number of inventory lines (villages) of this file in our index |
| `lines_located` | how many of those lines have their own `view` |
| `microfilm` | FamilySearch film number(s), separated by ` · `. A file may span several reels |
| `view_range` | first and last image of the file inside each reel, one range per reel, separated by ` · ` |
| `file_start_url` | link to the first image of the file in the FamilySearch viewer (or to the list of files on the reel when the start is unknown), one per reel, separated by ` · ` |
| `film_url` | link to the reel's page in FamilySearch, one per reel, separated by ` · ` |

## lignes.csv -- one inventory line (one village in one file) per row

| field | meaning |
|---|---|
| `inventory`, `file`, `cote` | the file this line belongs to |
| `uezd` | district of the period, as for the file |
| `village_inventory` | the name **as the inventory spells it**, in Romanian, with its prefix (`s.` village, `or.` town...). Never normalised, never merged |
| `village_film` | the name the film is filed under (FamilySearch catalogue: the Russian name of the time in Latin letters), when the line has one; it can differ from the inventory's spelling |
| `year_from`, `year_to` | years of the register for this village (the file's years when the line gives none) |
| `church`, `church_code` | the church (its *hram*, patron saint or feast) as written in Romanian, and its short code. Two villages with the same name are told apart by uezd and church. `Rabinat` marks a Jewish register |
| `folios` | folios of the village in the file as printed by the inventory, `91v-94` (`v` = verso) |
| `microfilm` | FamilySearch film number of the reel that carries this village |
| `view` | image number, counted by the viewer inside the file, of the first page of the village. Empty when the village is not located on the film |
| `image_url` | direct link to that image in the FamilySearch viewer (built as `https://www.familysearch.org/ark:/61903/3:1:<ark>?i=<view-1>&groupId=1943763`). Empty when `view` is empty |
| `film_url` | link to the page of the reel(s) carrying this line in FamilySearch, as in `dossiers.csv`. The start of the file (`file_start_url`) is in `dossiers.csv`: join on `cote` |
| `other_spellings` | other spellings of the same village found in the inventory or the film catalogue, separated by ` | `. They are searched, and not displayed on the page |

A line is identified by file + spelling + folios. Two lines with the same
name are **not** merged.

## index.jsonl -- one JSON object per line, one line per archival file

Same fields, with the villages nested under `villages` and the reels under
`films`. Empty fields are omitted rather than left blank. In `villages`,
`years` is `[year_from, year_to]`.

## What this index does NOT do

- It does not index **people**. There is no name of an inhabitant here, only
  place names from the inventory. The names are on the images.
- It does not cover the **poll tax censuses** (revision lists, *catagrafii*),
  which are fond 134 at the same archive and have their own index:
  https://index-moldova-revision-lists.github.io/
- It does not host any image. Every link points to FamilySearch, where
  viewing needs a free account, and where access to some images is
  restricted by contract.
- It is not complete: the inventory was read by machine, and a gap in the
  index (a year, a village) does not prove that the register does not exist.
