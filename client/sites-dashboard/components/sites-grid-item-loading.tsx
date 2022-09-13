import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { siteThumbnail } from './sites-grid-item';
import { SitesGridTile } from './sites-grid-tile';

const PrimaryPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
} );

const SecondaryPlaceholder = styled( LoadingPlaceholder )( {
	height: 14,
	width: '50%',
} );

export const SitesGridItemLoading = ( { delayMS }: { delayMS: number } ) => {
	return (
		<SitesGridTile
			leading={ <LoadingPlaceholder className={ siteThumbnail } delayMS={ delayMS } /> }
			primary={ <PrimaryPlaceholder delayMS={ delayMS } /> }
			secondary={ <SecondaryPlaceholder delayMS={ delayMS } /> }
		/>
	);
};
