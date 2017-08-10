/** @format */
var PropTypes = require( 'prop-types' );
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var NoResults = require( 'my-sites/no-results' );

module.exports = localize(
	class extends React.Component {
		static displayName = 'MediaLibraryListNoResults';

		static propTypes = {
			filter: PropTypes.string,
			search: PropTypes.string,
		};

		static defaultProps = {
			search: '',
		};

		getLabel = () => {
			var label;

			switch ( this.props.filter ) {
				case 'images':
					label = this.props.translate( 'No images match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: (
								<em>
									{ this.props.search }
								</em>
							),
						},
						context: 'Media no search results',
					} );
					break;
				case 'videos':
					label = this.props.translate( 'No videos match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: (
								<em>
									{ this.props.search }
								</em>
							),
						},
						context: 'Media no search results',
					} );
					break;
				case 'audio':
					label = this.props.translate( 'No audio files match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: (
								<em>
									{ this.props.search }
								</em>
							),
						},
						context: 'Media no search results',
					} );
					break;
				case 'documents':
					label = this.props.translate( 'No documents match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: (
								<em>
									{ this.props.search }
								</em>
							),
						},
						context: 'Media no search results',
					} );
					break;
				default:
					label = this.props.translate( 'No media files match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: (
								<em>
									{ this.props.search }
								</em>
							),
						},
						context: 'Media no search results',
					} );
					break;
			}

			return label;
		};

		render() {
			return (
				<NoResults text={ this.getLabel() } image="/calypso/images/pages/illustration-pages.svg" />
			);
		}
	}
);
