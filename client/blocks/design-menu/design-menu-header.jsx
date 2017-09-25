/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SiteCard from 'blocks/site';
import Button from 'components/button';
import Card from 'components/card';

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
