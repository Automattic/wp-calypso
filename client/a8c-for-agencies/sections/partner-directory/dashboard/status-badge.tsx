import { BadgeType, Button, Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import A4APopover from '../../../components/a4a-popover';

interface Props {
	statusProps: {
		status: string;
		type: BadgeType;
	};
	showPopoverOnLoad: boolean;
}

const PREFERENCE_NAME = 'a4a-partner-directory-dashboard-not-approved-popover';

export default function DashboardStatusBadge( { statusProps, showPopoverOnLoad }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showPopover, setShowPopover ] = useState( false );
	const popoverShown = useSelector( ( state ) => getPreference( state, PREFERENCE_NAME ) );

	const onUpdateExpertiseClick = useCallback( () => {
		setShowPopover( false );
		dispatch( savePreference( PREFERENCE_NAME, true ) );
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_update_expertise_click' ) );
	}, [ dispatch ] );

	const onClickDoItLater = useCallback( () => {
		setShowPopover( false );
		dispatch( savePreference( PREFERENCE_NAME, true ) );
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_do_it_later_click' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( showPopoverOnLoad && ! popoverShown ) {
			setShowPopover( true );
		}
	}, [ showPopoverOnLoad, popoverShown ] );

	const popoverContent =
		statusProps.status === 'Not approved' ? (
			<div>
				<Button
					compact
					primary
					href="/partner-directory/agency-expertise"
					onClick={ onUpdateExpertiseClick }
				>
					{ translate( 'Update my expertise' ) }
				</Button>
				{ ! popoverShown && (
					<Button compact onClick={ onClickDoItLater }>
						{ translate( `I'll do it later` ) }
					</Button>
				) }
			</div>
		) : undefined;

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	if ( ! popoverContent ) {
		return (
			<span>
				<Badge
					className="step-section-item__status"
					children={ statusProps.status }
					type={ statusProps.type }
				/>
			</span>
		);
	}

	const handleShowPopover = ( show: boolean ) => {
		if ( ! showPopoverOnLoad || popoverShown ) {
			setShowPopover( show );
		}
	};

	return (
		<span
			onMouseEnter={ () => handleShowPopover( true ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
		>
			<Badge
				className="step-section-item__status"
				children={ statusProps.status }
				type={ statusProps.type }
			/>
			{ showPopover && popoverContent && (
				<A4APopover
					title={ translate(
						"Your agency wasn't approved. Please check your email for feedback from our review team."
					) }
					offset={ 12 }
					wrapperRef={ wrapperRef }
					onFocusOutside={ () => handleShowPopover( false ) }
				>
					{ popoverContent }
				</A4APopover>
			) }
		</span>
	);
}
