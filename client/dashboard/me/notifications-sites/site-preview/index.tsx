import { Site } from '@automattic/api-core';
import { __experimentalGrid as Grid, __experimentalHStack as HStack } from '@wordpress/components';
import { Name, URL } from '../../../sites/site-fields';
import SiteIcon from '../../../sites/site-icon';
import { getSiteDisplayName } from '../../../utils/site-name';

import './index.scss';

interface Props {
	site: Site;
}

export const SitePreview = ( { site }: Props ) => {
	return (
		<HStack className="site-preview" spacing={ 3 }>
			<SiteIcon site={ site } size={ 44 } />
			<Grid columns={ 1 } templateRows="24px 1fr" gap={ 0 } style={ { width: '100%' } }>
				<div className="site-preview__name">
					<Name site={ site } value={ getSiteDisplayName( site ) } />
				</div>
				<div className="site-preview__url">
					<URL site={ site } value={ site.URL } />
				</div>
			</Grid>
		</HStack>
	);
};
