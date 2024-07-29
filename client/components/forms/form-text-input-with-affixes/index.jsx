import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

export default class extends Component {
	static displayName = 'FormTextInputWithAffixes';

	static propTypes = {
		noWrap: PropTypes.bool,
		prefix: PropTypes.node,
		suffix: PropTypes.node,
	};

	render() {
		const { noWrap, prefix, suffix, ...rest } = this.props;

		return (
			<div className={ clsx( 'form-text-input-with-affixes', { 'no-wrap': noWrap } ) }>
				{ prefix && <span className="form-text-input-with-affixes__prefix">{ prefix }</span> }

				<FormTextInput { ...rest } />

				{ suffix && <span className="form-text-input-with-affixes__suffix">{ suffix }</span> }
			</div>
		);
	}
}
