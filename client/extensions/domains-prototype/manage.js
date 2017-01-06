/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
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
			<Card>
				<h2 className={ styles.header }>{ domain } is not set up yet</h2>
				<Button href={ '/start/site-selected/?siteSlug=' + domain }>Set up site</Button>
				<p>Plans start at $123 per year. Get your first year free.</p>

				<div>
					<a href={ '/domains/manage/' + domain + '/edit/' + domain }>Advanced</a>
				</div>
			</Card>
		);
	}

	render() {
		return this.unSetUpState();
	}
}

Manage.propTypes = {
	domain: PropTypes.string.required
};

export default withStyles( styles )( Manage );
