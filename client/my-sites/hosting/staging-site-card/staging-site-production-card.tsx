import { Button, Card, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import CardHeading from 'calypso/components/card-heading';
import Notice from 'calypso/components/notice';
import { urlToSlug } from 'calypso/lib/url';
import { LoadingPlaceholder } from 'calypso/my-sites/hosting/staging-site-card/loading-placeholder';
import {
	useProductionSiteDetail,
	ProductionSite,
} from 'calypso/my-sites/hosting/staging-site-card/use-production-site-detail';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

const SiteRow = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginBottom: 24,
	'.site-icon': { flexShrink: 0 },
} );

const SiteInfo = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	marginLeft: 10,
} );

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
} );

type CardProps = {
	disabled: boolean;
	siteId: number;
};

function StagingSiteProductionCard( { disabled, siteId }: CardProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ loadingError, setLoadingError ] = useState( null );
	const { data: productionSite, isLoading } = useProductionSiteDetail( siteId, {
		enabled: ! disabled,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_load_failure', {
					code: error.code,
				} )
			);
			setLoadingError( error );
		},
	} );

	const getLoadingErrorContent = ( message: string ) => {
		return (
			<Notice status="is-error" showDismiss={ false }>
				{ message }
			</Notice>
		);
	};

	const getManageStagingSiteContent = ( productionSite: ProductionSite ) => {
		return (
			<>
				<p>{ __( 'The production site is available at:' ) }</p>
				<SiteRow>
					<SiteIcon siteId={ productionSite.id } size={ 40 } />
					<SiteInfo>
						<div>{ productionSite.name }</div>
						<div>
							<a href={ productionSite.url }>{ productionSite.url }</a>
						</div>
					</SiteInfo>
				</SiteRow>
				<ActionButtons>
					<Button
						primary
						href={ `/home/${ urlToSlug( productionSite.url ) }` }
						disabled={ disabled }
					>
						<span>{ __( 'Manage production site' ) }</span>
					</Button>
				</ActionButtons>
			</>
		);
	};

	let cardContent;
	if ( ! isLoading && productionSite ) {
		cardContent = getManageStagingSiteContent( productionSite );
	} else if ( isLoading ) {
		cardContent = <LoadingPlaceholder />;
	} else if ( loadingError ) {
		cardContent = getLoadingErrorContent(
			__(
				'Unable to load production site detail. Please contact support if you believe you are seeing this message in error.'
			)
		);
	}
	return (
		<Card className="staging-site-card">
			{
				// eslint-disable-next-line wpcalypso/jsx-gridicon-size
				<Gridicon icon="science" size={ 32 } />
			}
			<CardHeading id="staging-site">{ __( 'Staging site' ) }</CardHeading>
			{ cardContent }
		</Card>
	);
}

export default connect( ( state ) => {
	const currentUserId = getCurrentUserId( state );

	return {
		currentUserId,
	};
} )( StagingSiteProductionCard );
