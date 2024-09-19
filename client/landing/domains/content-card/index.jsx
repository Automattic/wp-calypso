import { Button, CompactCard } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

class DomainsLandingContentCard extends Component {
	static propTypes = {
		title: PropTypes.node.isRequired,
		message: PropTypes.node,
		messageAlignCenter: PropTypes.bool,
		actionTitle: PropTypes.node,
		actionCallback: PropTypes.func,
		actionPrimary: PropTypes.bool,
		actionBusy: PropTypes.bool,
		alternateActionTitle: PropTypes.node,
		alternateActionCallback: PropTypes.func,
		alternateActionPrimary: PropTypes.bool,
		alternateActionBusy: PropTypes.bool,
		footer: PropTypes.node,
		isLoading: PropTypes.bool,
	};

	static defaultProps = {
		isLoading: false,
		actionPrimary: true,
		actionBusy: false,
		alternateActionPrimary: false,
		alternateActionBusy: false,
		messageAlignCenter: false,
	};

	renderPlaceholder = () => {
		const { title } = this.props;

		return (
			<CompactCard className="content-card content-card__loading-placeholder">
				<h2 className="content-card__title">{ title }</h2>
				<h3 className="content-card__message">loading</h3>
				<h3 className="content-card__message">loading</h3>
				<p className="content-card__footer">loading</p>
			</CompactCard>
		);
	};

	render() {
		const {
			title,
			message,
			messageAlignCenter,
			actionTitle,
			actionCallback,
			actionPrimary,
			actionBusy,
			alternateActionTitle,
			alternateActionCallback,
			alternateActionPrimary,
			alternateActionBusy,
			footer,
			isLoading,
		} = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		const messageClasses = clsx( 'content-card__message', {
			message_align_center: messageAlignCenter,
		} );

		return (
			<CompactCard className="content-card">
				<h2 className="content-card__title">{ title }</h2>
				{ message && <h3 className={ messageClasses }>{ message }</h3> }
				{ actionTitle && (
					<Button
						className="content-card__action-button"
						busy={ actionBusy }
						disabled={ actionBusy }
						primary={ actionPrimary }
						onClick={ actionCallback }
					>
						{ actionTitle }
					</Button>
				) }
				{ alternateActionTitle && (
					<Button
						className="content-card__alternate-action-button"
						busy={ alternateActionBusy }
						disabled={ alternateActionBusy }
						primary={ alternateActionPrimary }
						onClick={ alternateActionCallback }
					>
						{ alternateActionTitle }
					</Button>
				) }
				{ footer && <p className="content-card__footer">{ footer }</p> }
			</CompactCard>
		);
	}
}

export default DomainsLandingContentCard;
