import { Card } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import supportIllustration from 'calypso/assets/images/illustrations/happiness-support.svg';
import FormattedHeader from 'calypso/components/formatted-header';

class Confirmation extends Component {
	static propTypes = {
		description: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { children, description, title } = this.props;

		return (
			<Card className="shared__confirmation">
				<img className="shared__confirmation-illustration" src={ supportIllustration } alt="" />

				<FormattedHeader headerText={ title } subHeaderText={ description } />

				{ children }
			</Card>
		);
	}
}

export default Confirmation;
