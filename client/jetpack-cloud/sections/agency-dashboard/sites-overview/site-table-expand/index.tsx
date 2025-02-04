import { Button } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import SiteTablePopover from './site-table-popover';
import SiteTableTooltip from './site-table-tooltip';

const PREF_EXPANDABLE_BLOCK_POPOVER_MESSAGE =
	'jetpack-cloud-agency-dashboard-expandable-block-popover-message';

interface Props {
	index: number;
	setExpanded: () => void;
	isExpanded: boolean;
	siteId: number;
}
export default function SiteTableExpand( { index, setExpanded, isExpanded, siteId }: Props ) {
	const dispatch = useDispatch();
	const buttonRef = useRef< HTMLButtonElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const preference = useSelector( ( state ) =>
		getPreference( state, PREF_EXPANDABLE_BLOCK_POPOVER_MESSAGE )
	);
	const savePreferenceType = () => {
		dispatch(
			savePreference( PREF_EXPANDABLE_BLOCK_POPOVER_MESSAGE, {
				...preference,
				dismiss: true,
			} )
		);
	};
	const isPopoverDismissed = index === 0 ? preference?.dismiss : true;

	const props = {
		className: 'site-table__expandable-button',
		borderless: true,
		onClick: setExpanded,
		...( ! isExpanded &&
			isPopoverDismissed && {
				ref: buttonRef,
				onMouseEnter: () => setShowTooltip( true ),
				onMouseLeave: () => setShowTooltip( false ),
				onMouseDown: () => setShowTooltip( false ),
			} ),
		...( ! isPopoverDismissed && {
			ref: buttonRef,
		} ),
	};

	return (
		<td
			className={ clsx( 'site-table__actions site-table__expand-row', {
				'site-table__td-without-border-bottom': isExpanded,
			} ) }
		>
			<>
				<Button { ...props }>
					<Icon icon={ isExpanded ? chevronUp : chevronDown } />
				</Button>
				{ ! isExpanded && isPopoverDismissed && (
					<SiteTableTooltip ref={ buttonRef } siteId={ siteId } showTooltip={ showTooltip } />
				) }
				{ ! isPopoverDismissed && (
					<SiteTablePopover savePreferenceType={ savePreferenceType } ref={ buttonRef } />
				) }
			</>
		</td>
	);
}
