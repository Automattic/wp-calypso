import { Popover } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SiteSelector from 'calypso/components/site-selector';
import { hasTouch } from 'calypso/lib/touch-detect';

import './style.scss';

const noop = () => {};

class SitesPopover extends Component {
	static propTypes = {
		showDelay: PropTypes.number,
		context: PropTypes.object,
		visible: PropTypes.bool,
		onClose: PropTypes.func,
		position: PropTypes.string,
		id: PropTypes.string,
		groups: PropTypes.bool,
		className: PropTypes.string,
	};

	static defaultProps = {
		visible: false,
		onClose: noop,
		position: 'bottom left',
		groups: false,
		siteQuerystring: false,
		className: '',
	};

	renderHeader() {
		return <div className="sites-popover__header">{ this.props.header }</div>;
	}

	renderSiteSelector() {
		return (
			<SiteSelector
				siteBasePath="/post"
				onSiteSelect={ this.props.onSiteSelect }
				showAddNewSite={ false }
				indicator={ false }
				autoFocus={ ! hasTouch() } // eslint-disable-line jsx-a11y/no-autofocus
				groups
				onClose={ this.props.onClose }
			/>
		);
	}

	render() {
		const classes = clsx(
			this.props.className,
			'popover sites-popover',
			this.props.header && 'has-header'
		);

		return (
			<Popover
				id={ this.props.id }
				showDelay={ this.props.showDelay }
				isVisible={ this.props.visible }
				context={ this.props.context }
				onClose={ this.props.onClose }
				position={ this.props.position }
				className={ classes }
			>
				{ this.renderHeader() }
				{ this.renderSiteSelector() }
			</Popover>
		);
	}
}

export default SitesPopover;
