---
name: Marketplace New Product
about: Adding new product to the Marketplace
title: 'Adding [product name] to the Marketplace'
labels: Marketplace, [Type] Task
assignees: ''
---

**Checklist**

- [ ] Create a catalog product and yearly plan
- [ ] Create monthly plan against the same product
- [ ] Sync the new catalog product and plans from store sandbox to production
- [ ] Add catalog product id constants
- [ ] Add store product to catalog product mapping
- [ ] Generate the legacy store_product records
- [ ] Add a store product name for translation
- [ ] Notify accounting on a8cscorecard p2
- [ ] Add new marketplace product entry
- [ ] Add vendor info
- [ ] Make an atomic p2 request to have the plugin be flagged as managed

**Testing**

- [ ] Billing product is created in `billing_products`
- [ ] Billing plans are created in `billing_plans`
- [ ] Legacy records are created in `store_products`
- [ ] Products are returned in `/products` response

### Blockers 🤷‍♀️

### Other Issues 🐛

---

cc @Automattic/bespin @Automattic/explorers
