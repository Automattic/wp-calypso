import {
	Button,
	Popover,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState, ComponentProps } from 'react';
import { formatDate } from '../../../../utils/datetime';
import { urlToSlug } from '../../../../utils/url';

import './commission-columns.scss';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const MigratedOnColumn = ( {
	migratedOn,
	locale,
}: {
	migratedOn: number;
	locale: string;
} ) => {
	const date = new Date( migratedOn * 1000 );
	return <>{ formatDate( date, locale ) }</>;
};

export const ReviewStatusColumn = ( {
	reviewStatus,
	rejectionReason,
}: {
	reviewStatus: string;
	rejectionReason?: string;
} ) => {
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const [ infoButtonAnchor, setInfoButtonAnchor ] = useState< HTMLButtonElement | null >( null );

	// Don't show a badge if status is empty
	if ( ! reviewStatus ) {
		return null;
	}

	const getStatusProps = (): {
		statusText: string;
		intent: NonNullable< ComponentProps< typeof Badge >[ 'intent' ] >;
	} | null => {
		switch ( reviewStatus ) {
			case 'paid':
				return { statusText: __( 'Paid' ), intent: 'stable' };
			case 'verified':
				return { statusText: __( 'Confirmed' ), intent: 'stable' };
			case 'rejected':
				return { statusText: __( 'Ineligible' ), intent: 'informational' };
			case 'ineligible':
				return { statusText: __( 'Ineligible' ), intent: 'informational' };
			case 'reverification':
				return { statusText: __( 'Pending re-verification' ), intent: 'informational' };
			case 'pending':
				return { statusText: __( 'Pending' ), intent: 'medium' };
			default:
				// Unknown status - don't show a badge
				return null;
		}
	};

	const statusProps = getStatusProps();

	if ( ! statusProps ) {
		return null;
	}

	const badge = <Badge intent={ statusProps.intent }>{ statusProps.statusText }</Badge>;

	if ( ( reviewStatus === 'rejected' || reviewStatus === 'ineligible' ) && rejectionReason ) {
		return (
			<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
				{ badge }
				<Button
					ref={ setInfoButtonAnchor }
					size="small"
					icon={ info }
					iconSize={ 18 }
					label={ __( 'View ineligibility reason' ) }
					onClick={ () => setIsPopoverVisible( ( visible ) => ! visible ) }
				/>
				{ isPopoverVisible && (
					<Popover
						anchor={ infoButtonAnchor }
						offset={ 12 }
						placement="bottom"
						focusOnMount
						onClose={ () => setIsPopoverVisible( false ) }
					>
						<VStack className="migrations-commission-status-popover" spacing={ 1 }>
							<Text weight={ 600 }>{ __( 'Ineligibility reason' ) }</Text>
							<Text>{ rejectionReason }</Text>
						</VStack>
					</Popover>
				) }
			</HStack>
		);
	}

	return badge;
};
