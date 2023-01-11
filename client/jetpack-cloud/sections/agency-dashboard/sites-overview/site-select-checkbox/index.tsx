import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	item: SiteData;
	siteError: boolean;
}

export default function SiteSelectCheckbox( { item, siteError }: Props ) {
	return (
		<FormInputCheckbox
			className="site-select-checkbox disable-card-expand"
			id={ item.blog_id }
			onClick={ item.onSelect }
			checked={ item.isSelected }
			readOnly={ true }
			disabled={ siteError }
		/>
	);
}
