# Algorithm lab

A static classroom playground for COMP2711: draggable cards in fixed memory slots, selection sort, insertion sort, bubble sort, merging two sorted lists, recursive merge sort, quicksort, linear search, binary search, and the Alice–Bob guessing game.

## Preview

Open `dist/index.html` directly, or serve the directory:

```sh
cd dist
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit http://127.0.0.1:8765/ . No packages, build, backend, or external assets are needed.

## Classroom controls

- Free play: drag to swap occupied slots or move into empty workspace slots. Arrow keys move the focused card between adjacent slots. Undo restores the last arrangement.
- A and B identify memory banks; bracketed numbers identify slots. Cards contain values. The memory-access panel describes reads and writes for a move or swap.
- Line up packs cards into A in their current row order. Switching from Free play to a sorting algorithm or Linear search uses the current values in A. Returning to Free play restores its slot arrangement; B is workspace, not algorithm input.
- Selection sort stores both `nextMin` and `nextMinPosition`; the comparison reads one array slot and compares its value against the stored minimum.
- Guided modes: play/pause, previous/next step, restart, speed, and timeline scrubbing (including the final step). Space and arrow shortcuts work when focus is outside form controls and buttons.
- Insertion sort keeps `key` outside the array while values are copied right. Its blue-green prefix is sorted but not necessarily in final positions. Bubble sort uses fixed passes and shows `j` / `j+1`.
- Linear search scans for the first match. Binary search uses its own sorted input and can return any matching position; `low`, `mid`, and `high` pointers and the remaining interval are shown. Both modes accept a target, report absence, and count array reads separately from value comparisons. A binary-search probe may perform an equality test and an order test.
- Merging requires sorted input lists; either list can be empty. Inputs remain visible while values are copied into output slots.
- Alice & Bob: play against a hidden random secret, or step through linear and binary strategies with a chosen secret. Click a number or enter a guess; replies narrow the candidate set. The counter counts AskAlice calls, including the correct guess. Supports ranges 1…n with n from 1 to 64; the default guided example is n = 16, secret = 13.
- Quicksort uses the last value as pivot and partitions in place. The `scan`, `nextSmall`, and pivot arrows show the current partition; fixed pivot positions stay marked while both subarrays are recursively sorted. Comparisons and actual swaps are counted; self-swaps are omitted. This deterministic last-pivot version has quadratic worst-case time, including all-equal input.
- Input limits: at most 12 values total, integers from -999 to 999. Small letters identify cards, including equal-valued cards.

The current-position arrow `i` appears alongside `nextMinPosition` in selection sort. Pointers that share a slot are stacked above one arrow.

## GitHub Pages

Copy the **contents** of `dist/` into the `COMP2711/sorting/` directory of the existing GitHub Pages source. If COMP2711 is itself the Pages repository, use `sorting/` relative to that repository’s published root. Add this link to the course page:

```html
<a href="./sorting/">Sorting playground</a>
```

Intended URL: https://wuwuz.github.io/COMP2711/sorting/

All assets use relative URLs. The existing course homepage should remain untouched apart from its optional new link. No GitHub upload or public deployment has been performed.

## Validation

Run `node tests/algorithms.cjs`, `node tests/search-and-sorting.cjs`, `node tests/guessing.cjs`, and `node tests/quicksort.cjs`. The guessing tests cover all 4,160 combinations of range, secret, and strategy through n = 64, including interval invariants, exact linear counts, and the binary worst-case bound. This checks 1,095 arrays across selection, merge, and merge sort; exact selection comparison counts; swap and merge bounds; stable merge-sort output; monotone counters; and input immutability.

Browser checks passed in Chrome: pointer swapping, keyboard workspace moves, undo, memory-access descriptions, all three algorithms, exact example counts, rejection of invalid inputs, empty merge input, singleton input, playback/pause, mobile layouts, and direct offline opening. No browser runtime exceptions were observed. Further enumeration checked insertion and bubble sorting on 1,095 inputs and 10,950 searches, including duplicates and empty arrays. Browser checks covered all four new modes, selection’s i pointer, saved insertion keys, discarded binary-search intervals, invalid sorted input, and absent targets.

Design reference: https://visualgo.net/en/sorting (custom inputs, playback, and code tracing). Implementation and styling are original.

Quicksort validation: 3,316 input arrays checked for sorted output, card identities, fixed positions, partition bounds, counters and duplicate worst cases. Chrome checks cover pseudocode/pointers, input changes, playback/pause/rewind, mobile overflow and switching to search/game modes.
