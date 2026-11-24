# HULL-ION Materials Workbench

**[Open the workbench](https://ahvsjags.github.io/hull-ion-workbench/)** — no account, installation, or API key required.

Explore 6,228 Li/Na solid-electrolyte candidates, compare up to four records, rotate the reported Top-20 crystal structures, and download their CIFs. The validation view provides local DFT–NEB path results, 0 K metal-referenced bulk phase assessments, external tests, and matched-set ranking comparisons. Download screened candidates and result tables as CSV.

## Screen your own predictions

Open **Screening Lab** and download the CSV template. Provide the following columns:

~~~text
formula,p_stable,e_hull,p_synth,uncertainty_rank,qc_pass
Na3PS4,0.91,0.012,0.74,0.20,true
~~~

The example row illustrates the input format; it is not a reported result. Use eV/atom for hull distance and 0–1 for the other numerical inputs. The uncertainty percentile must already have been computed upstream. Paste the CSV or select a CSV file, adjust the thresholds, and export the retained records. Files and data stay in the browser. The lab does not train models, run inference on a CIF, or submit new DFT jobs.

The initial thresholds are 0.70 for stability probability, 0.05 eV/atom for screening hull distance, 0.50 for synthesizability score, and 0.80 for uncertainty percentile. They reproduce 439 passes in the public snapshot, of which 353 also pass structure QC.

## Run locally

Download this repository as a ZIP, extract it, and open **index.html** in a modern browser. To serve it over HTTP, run **python -m http.server 8000** from the extracted folder. The app is static and does not require dependencies, a build step, or a backend. Bookmarks are browser-local.

## Data and attribution

See [Data sources and attribution](DATA-SOURCES.md) for the originating databases and CIF credits. The [snapshot manifest](data/snapshot-manifest.json) records the release and dataset digest. Candidate scores, calculated barriers, and sampled voltage ranges are research outputs, not experimental conductivity or operating windows. Cite the [HULL-ION research project](https://github.com/ahvsjags/hull-ion) together with the relevant source databases.

This public repository contains only the web application and its curated data snapshot. It does not contain manuscript files, correspondence, reviewer responses, raw calculation logs, training datasets, or model checkpoints.
