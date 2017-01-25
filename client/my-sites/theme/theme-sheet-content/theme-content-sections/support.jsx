/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

const ContactUs = localize(
	( { isCurrentUserPaid, translate, isPrimary } ) => {
		if ( ! isCurrentUserPaid ) {
			//Contact is only shown for paying users
			return null;
		}

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Need extra help?' ) }
					<small>{ translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button primary={ isPrimary } href={ '/help/contact/' }>Contact us</Button>
			</Card>
		);
	}
);

const Forum = localize(
	( { translate, forumUrl, isPremium, isPrimary = false } ) => {

		if ( ! forumUrl ) {
			return null;
		}

		const description = isPremium
			? translate( 'Get in touch with the theme author' )
			: translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button primary={ isPrimary } href={ forumUrl }>Visit forum</Button>
			</Card>
		);
	}
);

const CssSupport = localize(
	( { translate } ) => (
		<Card className="theme__sheet-card-support">
			<Gridicon icon="briefcase" size={ 48 } />
			<div className="theme__sheet-card-support-details">
				{ translate( 'Need CSS help? ' ) }
				<small>{ translate( 'Get help from the experts in our CSS forum' ) }</small>
			</div>
			<Button href="//en.forums.wordpress.com/forum/css-customization">Visit forum</Button>
		</Card>
	)
);

const Support = ( { isCurrentUserPaid, isPremium, theme } ) => (
	<div>
		<ContactUs
			isCurrentUserPaid={ isCurrentUserPaid }
			isPrimary={ true }
		/>
		<Forum
			forumUrl={ theme.forumUrl }
			isPremium={ isPremium }
		/>
		<CssSupport />
	</div>
);

export default Support;
