/**
 * External dependencies
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import styles from './styles';

class Manage extends React.Component {

	unSetUpState() {
		const { domain } = this.props;
		return (
			<Card className={ styles.manage }>
				<h2 className={ styles.header }>{ domain } is not set up yet</h2>
				<Button className={ styles.setUpButton } href={ '/start/site-selected/?siteSlug=' + domain } primary>Set up site</Button>
				<p>Plans start at $123 per year.<br />Get your first year free.</p>

				<div className={ styles.advanced }>
					<a href={ '/domains/manage/' + domain + '/edit/' + domain }>Advanced</a>
				</div>
			</Card>
		);
	}

	render() {
		return this.unSetUpState();
	}
}

export default withStyles( styles )( Manage );
