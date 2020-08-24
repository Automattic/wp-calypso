/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import EmbedDialog from '../dialog';
import { getCurrentUser } from 'state/current-user/selectors';

class EmbedDialogExample extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	state = {
		embedUrl: 'https://www.youtube.com/watch?v=R54QEvTyqO4',
		showDialog: false,
	};

	openDialog = () => this.setState( { showDialog: true } );

	onCancel = () => {
		this.setState( { showDialog: false } );
	};

	onUpdate = ( newUrl ) => {
		this.setState( {
			embedUrl: newUrl,
			showDialog: false,
		} );
	};

	render() {
		return (
			<Card>
				<Button onClick={ this.openDialog }>Open Embed Dialog</Button>

				<EmbedDialog
					embedUrl={ this.state.embedUrl }
					isVisible={ this.state.showDialog }
					onCancel={ this.onCancel }
					onUpdate={ this.onUpdate }
					siteId={ this.props.siteId }
				/>
			</Card>
		);
	}
}

const connectedEmbedDialogExample = connect( ( state ) => {
	return {
		siteId: get( getCurrentUser( state ), 'primary_blog' ),
	};
} )( EmbedDialogExample );

connectedEmbedDialogExample.displayName = 'EmbedDialogExample';

// todo
// connecting this component feels wrong. it's an example, so shouldn't it instantiate EmbedDialog with renderWithReduxStore
// like components/tinymce/plugins/embed/plugin.js does, rather than getting the siteid here?
// this is what the simple-payments example does, though.
// maybe because inside devdocs we can't use getSelectedSiteId(), we have to use get( getCurrentUser( state ), 'primary_blog' ),
// if that's the reason, would it be better to just pass in a hardcoded site ID here, instead of connect()ing this component?

export default connectedEmbedDialogExample;
