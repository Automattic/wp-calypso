/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import styles from './styles';

class Manage extends React.Component {

	render() {
		const { domain } = this.props;
		return (
			<div>
				<h2 className={ styles.header }>What do you want to use { domain } for?</h2>
				<Card href={ '/domains-prototype/manage/landing-page/' + domain }>
					<h2 className={ styles.cardHeader }>Landing Page</h2>
					<div>Customize a simple, one-page placeholder.</div>
				</Card>

				<Card href={ '/domains-prototype/manage/start/' + domain }>
					<h2 className={ styles.cardHeader }>New Site</h2>
					<div>Build a new website or blog.</div>
				</Card>

				<Card href={ '/domains-prototype/manage/connect/' + domain }>
					<h2 className={ styles.cardHeader }>Existing Site</h2>
					<div>Connect an existing website or redirect to your social media.</div>
				</Card>

				<Card href={ '/domains/manage/email/' + domain }>
					<h2 className={ styles.cardHeader }>Add Email</h2>
					<div>Add professional email to your domain.</div>
				</Card>

				<Card href={ '/domains/manage/' + domain + '/contacts-privacy/' + domain }>
					<h2 className={ styles.cardHeader }>Contact information</h2>
					<div>Keep your contact information up to date.</div>
				</Card>

				<Card href={ '/domains/manage/' + domain + '/edit/' + domain }>
					<h2 className={ styles.cardHeader }>Advanced</h2>
					<div>Make advanced changes to your domain; change the name servers or DNS.</div>
				</Card>
			</div>
		);
	}
}

Manage.propTypes = {
	domain: PropTypes.string.required
};

export default withStyles( styles )( Manage );
