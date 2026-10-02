export { getBundlePrimaryDomain } from './get-bundle-primary-domain';
export { getRootDomain } from './get-root-domain';
export { getTld } from './get-tld';
export { isFqdnQuery } from './is-fqdn-query';
export { isSubdomain } from './is-subdomain';
export { isSubdomainWithMappedRootDomain } from './is-subdomain-with-mapped-root-domain';
export {
	isBlogSubdomainQuery,
	isFreeSubdomainQuery,
	isWpcomSubdomainQuery,
	stripWpcomSubdomainSuffix,
} from './is-free-subdomain-query';
export { parseDomainAgainstTldList } from './parse-domain-against-tld-list';
export { parseMatchReasons } from './parse-match-reasons';
