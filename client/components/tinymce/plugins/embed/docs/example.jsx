/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import EmbedDialog from '../dialog';

export default class EmbedDialogExample extends PureComponent {
	static displayName = 'EmbedDialog';

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
				/>
			</Card>
		);
	}
}
