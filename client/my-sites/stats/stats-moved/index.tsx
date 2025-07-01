import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { Callout } from 'calypso/dashboard/components/callout';
import { STATS_PRODUCT_NAME, STATS_PRODUCT_NAME_IMPR } from 'calypso/my-sites/stats/constants';
import imageEn from './menu-en.png';

import './style.scss';

const StatsMoved = () => {
	return (
		<Main className="stats-moved" ariaLabel={ STATS_PRODUCT_NAME }>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<NavigationHeader title={ STATS_PRODUCT_NAME_IMPR } />
			<Callout
				icon={ chartBar }
				title={ __( 'Stats have moved' ) }
				description={
					<Text variant="muted">{ __( 'They can now be found at Jetpack → Stats.' ) }</Text>
				}
				image={ imageEn }
				actions={
					<Button variant="primary" size="compact" onClick={ () => {} }>
						{ __( 'Check new Stats' ) }
					</Button>
				}
			/>
		</Main>
	);
};

export default StatsMoved;
