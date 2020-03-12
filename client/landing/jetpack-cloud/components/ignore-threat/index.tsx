/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threatId: number;
	threatTitle: string;
	threatDescription: string;
	showDialog: boolean;
	onCloseDialog: Function;
}

class IgnoreThreatDialog extends React.PureComponent< Props > {
	render() {
		const buttons = [
			{ action: 'cancel', label: translate( 'Go Back' ), onClick: this.props.onCloseDialog },
			{
				action: 'save',
				label: translate( 'Ignore Threat' ),
				isPrimary: true,
				// onClick: () => alert( 'Saving...' ),
			},
		];
		return (
			<Dialog
				isVisible={ this.props.showDialog }
				onClose={ this.props.onCloseDialog }
				buttons={ buttons }
			>
				<h1 className="ignore-threat__header">
					{ translate( 'Do you really want to ignore this threat?' ) }
				</h1>
				<h3 className="ignore-threat__threat-title">{ this.props.threatTitle }</h3>
				<p className="ignore-threat__threat-description">{ this.props.threatDescription }</p>
				<div className="ignore-threat__warning">
					<Gridicon className="ignore-threat__warning-icon" icon="info" size={ 36 } />
					<p className="ignore-threat__warning-message">
						{ translate(
							'You shouldn’t ignore a security unless you are absolute sure it’s harmless. If you choose to ignore this threat, it will remain on your site: My Jetpack Site.'
						) }
					</p>
				</div>
			</Dialog>
		);
	}
}

export default IgnoreThreatDialog;
