/**
 * External dependencies
 *
 * @format
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
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

	onUpdate = newUrl => {
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

				{/*
				this isn't showing a preview at first, but then if you change the url it'll render a preview of the new url
				need to trigger something so that it shows it when it first gets rendered
				*/}
			</Card>
		);
	}
}

const connectedEmbedDialogExample = connect( state => {
	return {
		siteId: get( getCurrentUser( state ), 'primary_blog' ),
	};
} )( EmbedDialogExample );

connectedEmbedDialogExample.displayName = 'EmbedDialogExample';

// reviewer:
	// connecting this component feels wrong. it's an example, so shouldn't it instantiate EmbedDialog with renderWithReduxStore
	// like components/tinymce/plugins/embed/plugin.js does, rather than mocking the siteid here?
	// this is what the simple-payments example does, though.
	// why can this element access the redux store, but EmbedDialog can't?

export default connectedEmbedDialogExample;
