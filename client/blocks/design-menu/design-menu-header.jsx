/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SiteCard from 'blocks/site';
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const DesignMenuHeader = ( { isUnsaved, onBack, onPreview, onSave, site, translate } ) => {
	return (
		<span className="design-menu__header">
			<Button compact borderless onClick={ onBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>
			<SiteCard site={ site } />
			<Card className="design-menu__header-buttons">
				<Button primary compact
					disabled={ ! isUnsaved }
					className="design-menu__save"
					onClick={ onSave }
				>{ isUnsaved ? translate( 'Publish Changes' ) : translate( 'Saved' ) }</Button>
				<Button compact
					className="design-menu__preview"
					onClick={ onPreview }
				>{ translate( 'Preview changes' ) }</Button>
			</Card>
		</span>
	);
};

export default localize( DesignMenuHeader );
