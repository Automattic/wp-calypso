import { BadgeType, Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useRef, useState } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import FormattedDate from 'calypso/components/formatted-date';
import { urlToSlug } from 'calypso/lib/url/http-utils';

const DETAILS_DATE_FORMAT_SHORT = 'DD MMM YYYY';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const MigratedOnColumn = ( { migratedOn }: { migratedOn: number } ) => {
	const date = new Date( migratedOn * 1000 );
	return <FormattedDate date={ date } format={ DETAILS_DATE_FORMAT_SHORT } />;
};

export const ReviewStatusColumn = ( {
	reviewStatus,
	rejectionReason,
}: {
	reviewStatus: string;
	rejectionReason?: string;
} ) => {
	const buttonRef = useRef< HTMLButtonElement | null >( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	// Don't show a badge if status is empty
	if ( ! reviewStatus ) {
		return null;
	}

	const getStatusProps = () => {
		switch ( reviewStatus ) {
			case 'paid':
				return {
					statusText: __( 'Paid' ),
					statusType: 'success',
				};
			case 'verified':
				return {
					statusText: __( 'Confirmed' ),
					statusType: 'success',
				};
			case 'rejected':
				return {
					statusText: __( 'Ineligible' ),
					statusType: 'info',
				};
			case 'ineligible':
				return {
					statusText: __( 'Ineligible' ),
					statusType: 'info',
				};
			case 'reverification':
				return {
					statusText: __( 'Pending re-verification' ),
					statusType: 'info',
				};
			case 'pending':
				return {
					statusText: __( 'Pending' ),
					statusType: 'warning',
				};
			default:
				// Unknown status - don't show a badge
				return null;
		}
	};

	const statusProps = getStatusProps();

	if ( ! statusProps ) {
		return null;
	}

	const badge = (
		<StatusBadge
			statusProps={ {
				children: statusProps.statusText,
				type: statusProps.statusType as BadgeType,
			} }
		/>
	);

	if ( ( reviewStatus === 'rejected' || reviewStatus === 'ineligible' ) && rejectionReason ) {
		return (
			<span className="commission-columns__rejected-status">
				{ badge }
				<Button
					ref={ buttonRef }
					className="commission-columns__rejection-reason-button"
					onClick={ () => setIsPopoverVisible( ! isPopoverVisible ) }
					aria-label={ __( 'View ineligibility reason' ) }
				>
					<Icon icon={ info } size={ 18 } />
				</Button>
				{ isPopoverVisible && (
					<Popover
						context={ buttonRef.current }
						isVisible
						position="bottom"
						onClose={ () => setIsPopoverVisible( false ) }
					>
						<div className="commission-columns__rejection-reason-popover">
							<div className="commission-columns__rejection-reason-title">
								{ __( 'Ineligibility reason' ) }
							</div>
							<div className="commission-columns__rejection-reason-text">{ rejectionReason }</div>
						</div>
					</Popover>
				) }
			</span>
		);
	}

	return badge;
};
