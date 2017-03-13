
/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const renderTitle = ( unique, name, url ) => unique
	? <span className="docs-example__wrapper-header-title">
		{ name }
	</span>
	: <a className="docs-example__wrapper-header-title" href={ url }>
		{ name }
	</a>
;

const renderIsolateLink = ( url, isolate ) =>
	<a
		className="docs-example__wrapper__header-link"
		title={ isolate ? 'Integrate instance' : 'Isolate instance' }
		href={ `${ url }?isolate=${ isolate ? 'false' : 'true' }` }
	>
		<Gridicon
			className={ isolate ? 'docs-example__wrapper__rotated' : '' }
			icon="external"
			size={ 24 } />
	</a>
;

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		unique: PropTypes.bool,
		url: PropTypes.string.isRequired,
	};

	render() {
		const {
			children,
			isolate,
			name,
			unique,
			url,
		} = this.props;

		return (
			<div className={ classNames(
				'docs-example__wrapper',
				{ 'is-unique': unique }
			) }>
				<h2 className="docs-example__wrapper-header">
					{ renderTitle( unique, name, url ) }
					{ renderIsolateLink( url, isolate ) }
				</h2>
				{ children }
			</div>
		);
	}
}

export default DocsExampleWrapper;
