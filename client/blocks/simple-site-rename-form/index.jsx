/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { noop, get, flow } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import ConfirmationDialog from './dialog';

export class SimpleSiteRenameForm extends Component {
	state = {
		showDialog: false,
		domainFieldValue: '',
	};

	onSubmit = event => {
		event.preventDefault();

		this.setState( {
			showDialog: true,
		} );
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		this.setState( { domainFieldValue: get( event, 'target.value' ) } );
	};

	render() {
		const { currentDomainName, translate } = this.props;

		// This may need more consideration given the new x.music.blog type domains
		const isWPCOM = currentDomainName.type === 'WPCOM';
		// This is naive - there's surely a better way.
		const domainPrefix = currentDomainName.name.replace( '.wordpress.com', '' );

		const isDisabled =
			! isWPCOM || ! this.state.domainFieldValue || this.state.domainFieldValue === domainPrefix;

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ this.state.domainFieldValue }
					currentDomainName={ currentDomainName.name.replace( '.wordpress.com', '' ) }
				/>
				<form onSubmit={ this.onSubmit }>
					<Card className="simple-site-rename-form__content">
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ '.wordpress.com' }
							onBlur={ noop }
							onChange={ this.onFieldChange }
							onFocus={ noop }
							placeholder={ domainPrefix }
						/>
						<div className="simple-site-rename-form__info">
							<Gridicon icon="info-outline" size={ 18 } />
							<p>
								{ translate( 'This address was included with your site and is free for life!' ) }
							</p>
						</div>
					</Card>
					<CompactCard className="simple-site-rename-form__footer">
						<FormButton disabled={ isDisabled } type="submit">
							{ translate( 'Change Site Address' ) }
						</FormButton>
					</CompactCard>
				</form>
			</div>
		);
	}
}

export default flow( localize )( SimpleSiteRenameForm );
