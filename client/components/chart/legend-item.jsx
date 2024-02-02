import { FormLabel } from '@automattic/components';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';

export default class ChartLegendItem extends PureComponent {
	static propTypes = {
		attr: PropTypes.string.isRequired,
		changeHandler: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
		label: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	};

	clickHandler = () => {
		this.props.changeHandler( this.props.attr );
	};

	render() {
		return (
			<li className="chart__legend-option">
				<FormLabel className="chart__legend-label is-selectable">
					<FormInputCheckbox
						checked={ this.props.checked }
						className="chart__legend-checkbox"
						onChange={ this.clickHandler }
					/>
					<span className={ this.props.className } />
					{ this.props.label }
				</FormLabel>
			</li>
		);
	}
}
