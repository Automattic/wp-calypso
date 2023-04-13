import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	item: SiteData;
	siteError: boolean;
	isLargeScreen?: boolean;
}

export default function SiteSelectCheckbox( { item, siteError, isLargeScreen }: Props ) {
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent(
		[ item.site.value ],
		isLargeScreen
	);

	function handleCheckboxClick() {
		item.onSelect( item );
		recordEvent( item.isSelected ? 'site_unselected' : 'site_selected' );
	}

	return (
		<span className="site-select-checkbox">
			<FormInputCheckbox
				className="disable-card-expand"
				id={ item.blog_id }
				onClick={ handleCheckboxClick }
				checked={ item.isSelected }
				readOnly={ true }
				disabled={ siteError }
			/>
		</span>
	);
}
