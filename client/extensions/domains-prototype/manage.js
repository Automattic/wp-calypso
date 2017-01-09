/**
 * External dependencies
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import styles from './styles';

class Manage extends React.Component {

	unSetUpState() {
		const { domain } = this.props;
		return (
			<div className={ styles.manage }>
				<EmptyContent
					title= { domain + ' is not set up yet.' }
					line={ 'Plans start at $123 per year. Get your first year free.' }
					action={ 'Set Up Site' }
					actionURL={ '/start/site-selected/?siteSlug=' + domain }
					illustration={ '/calypso/images/drake/drake-browser.svg' } />

				<div className={ styles.advanced }>
					<a href={ '/domains/manage/' + domain + '/edit/' + domain }>Advanced...</a>
				</div>
			</div>
		);
	}

	render() {
		return this.unSetUpState();
	}
}

export default withStyles( styles )( Manage );
