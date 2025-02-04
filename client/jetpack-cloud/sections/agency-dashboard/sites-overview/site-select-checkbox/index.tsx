import { Tooltip } from '@automattic/components';
import { ReactNode, useRef, useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	item: SiteData;
	siteError: boolean;
	isLargeScreen?: boolean;
	disabled?: boolean;
	tooltip?: ReactNode;
}

export default function SiteSelectCheckbox( {
	item,
	siteError,
	isLargeScreen,
	disabled,
	tooltip,
}: Props ) {
	const [ showTooltip, setShowTooltip ] = useState( false );
	const checkboxRef = useRef< HTMLSpanElement | null >( null );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent(
		[ item.site.value ],
		isLargeScreen
	);

	const handleCheckboxClick = () => {
		item.onSelect?.();
		recordEvent( item.isSelected ? 'site_unselected' : 'site_selected' );
	};

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};

	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	return (
		<span
			className="site-select-checkbox"
			ref={ checkboxRef }
			role="button"
			tabIndex={ 0 }
			onMouseEnter={ handleShowTooltip }
			onMouseLeave={ handleHideTooltip }
			onMouseDown={ handleHideTooltip }
		>
			<FormInputCheckbox
				className="disable-card-expand"
				id={ `${ item.site.value.blog_id }` }
				onClick={ handleCheckboxClick }
				checked={ item.isSelected }
				readOnly
				disabled={ disabled || siteError }
			/>

			{ tooltip && (
				<Tooltip
					context={ checkboxRef.current }
					isVisible={ showTooltip }
					position="bottom"
					className="site-select-checkbox__tooltip"
				>
					{ tooltip }
				</Tooltip>
			) }
		</span>
	);
}
