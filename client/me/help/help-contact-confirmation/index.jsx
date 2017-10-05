/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';

module.exports = class extends React.PureComponent {
    static displayName = 'HelpContactConfirmation';

	static propTypes = {
		title: PropTypes.string.isRequired,
		message: PropTypes.node.isRequired
	};

	render() {
		return (
			<div className="help-contact-confirmation">
				<div className="help-contact-confirmation__contents">
					<div className="help-contact-confirmation__large-gridicon"><Gridicon icon={ 'checkmark-circle' } size={ 96 } /></div>
					<div className="help-contact-confirmation__small-gridicon"><Gridicon icon={ 'checkmark-circle' } size={ 56 } /></div>
					<FormSectionHeading>{ this.props.title }</FormSectionHeading>
					<p className="help-contact-confirmation__message">{ this.props.message }</p>
				</div>
			</div>
		);
	}
};
