/**
 * A tag applied to an agency-managed site, as returned by the agency site tag
 * endpoints. Only `name` is guaranteed; `label`/`slug` are present on the
 * richer tag responses.
 */
export interface AgencySiteTag {
	name: string;
	label?: string;
	slug?: string;
}
