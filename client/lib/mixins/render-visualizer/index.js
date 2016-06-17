/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' );

var RenderVisualizerMixin = {
		UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS: 500,
		MAX_LOG_LENGTH: 20,
		STATE_CHANGES: {
			MOUNT: 'mount',
			UPDATE: 'update'
		},

		renderLog: [],
		renderCount: 1,
		renderLogContainer: null,
		renderLogDetail: null,
		renderLogRenderCount: null,
		updateRenderLogPositionTimeout: null,

		styling: {
			renderLog: {
				color: 'rgb(85, 85, 85)',
				fontFamily: '\'Helvetica Neue\', Arial, Helvetica, sans-serif',
				fontSize: '14px',
				lineHeight: '18px',
				background: 'linear-gradient(#fff, #ccc)',
				boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
				textShadow: '0 1px 0 #fff',
				borderRadius: '7px',
				position: 'absolute',
				maxWidth: '70%',
				padding: '5px 10px',
				zIndex: '10000'
			},
			renderLogDetailNotes: {
				color: 'red',
				textAlign: 'center'
			},
			elementHighlightMonitor: {
				outline: '1px solid rgba(47, 150, 180, 1)'
			},
			elementHighlightMount: {
				outline: '3px solid rgba(197, 16, 12, 1)'
			},
			elementHighlightUpdate: {
				outline: '3px solid rgba(197, 203, 1, 1)'
			}
		},

		componentDidMount: function() {
			if ( this.isNotRenderable() ) {
				return;
			}
			this.resetRenderLog();
			this.addToRenderLog( 'Initial Render' );
			this.buildRenderLogNode();
			this.highlightChange( this.STATE_CHANGES.MOUNT );
			this.updateRenderLogPositionTimeout = setInterval(
					this.updateRenderLogPosition, this.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS );
		},

		componentDidUpdate: function( prevProps, prevState ) {
			if ( this.isNotRenderable() ) {
				return;
			}
			this.getReasonForReRender( prevProps, prevState );
			this.updateRenderLogNode();
			this.highlightChange( this.STATE_CHANGES.UPDATE );
		},

		componentWillUnmount: function() {
			if ( this.isNotRenderable() ) {
				return;
			}
			this.removeRenderLogNode();
			clearInterval( this.updateRenderLogPositionTimeout );
		},

		isNotRenderable: function() {
			return typeof this.constructor.displayName === 'undefined';
		},

		resetRenderLog: function() {
			this.renderLog = [];
			this.renderCountLog = 1;
		},

		applyCssStyling: function( node, styles ) {
			Object.keys( styles ).forEach( function( className ) {
				node.style[ className ] = styles[ className ];
			} );
		},

		buildRenderLogNode: function(){
			var renderLogContainer = document.createElement( 'div' ),
				renderLogRenderCountNode = document.createElement( 'div' ),
				renderLogDetailContainer = document.createElement( 'div' ),
				renderLogNameNode = document.createElement( 'strong' ),
				renderLogNotesNode = document.createElement( 'div' ),
				renderLogDetailNode = document.createElement( 'div' );

			renderLogContainer.className = 'renderLog';

			this.applyCssStyling( renderLogContainer, this.styling.renderLog );

			renderLogContainer.addEventListener( 'click', function() {

				if ( renderLogRenderCountNode.style.display === 'none' ) {
					renderLogRenderCountNode.style.display = 'block';
					renderLogDetailContainer.style.display = 'none';
					renderLogContainer.style.zIndex = '10000';
				} else {
					renderLogRenderCountNode.style.display = 'none';
					renderLogDetailContainer.style.display = 'block';
					renderLogContainer.style.zIndex = '10001';
				}
			} );

			renderLogRenderCountNode.className = 'renderLogCounter';
			renderLogRenderCountNode.innerText = 1;

			renderLogDetailContainer.style.display = 'none';
			renderLogNameNode.innerText = this.constructor.displayName;
			renderLogDetailNode.innerText = '';

			if ( this.shouldComponentUpdate ) {
				renderLogNotesNode.innerText += '\nNOTE: This component uses a custom shouldComponentUpdate(), so the results above are purely informational';
			}

			this.applyCssStyling( renderLogNotesNode, this.styling.renderLogDetailNotes );

			renderLogDetailContainer.appendChild( renderLogNameNode );
			renderLogDetailContainer.appendChild( renderLogDetailNode );
			renderLogDetailContainer.appendChild( renderLogNotesNode );

			renderLogContainer.appendChild( renderLogRenderCountNode );
			renderLogContainer.appendChild( renderLogDetailContainer );

			this.renderLogContainer = renderLogContainer;
			this.renderLogDetail = renderLogDetailNode;
			this.renderLogNotes = renderLogNotesNode;
			this.renderLogRenderCount = renderLogRenderCountNode;

			document.getElementsByTagName( 'body' )[ 0 ].appendChild( renderLogContainer );
			this.updateRenderLogPosition();
			this.updateRenderLogNode();
		},

		updateRenderLogPosition: function() {
			var parentNode = ReactDom.findDOMNode(this),
				parentNodeRect = parentNode && parentNode.getBoundingClientRect();

			if ( this.renderLogContainer && parentNodeRect ) {
				this.renderLogContainer.style.top = ( window.pageYOffset + parentNodeRect.top ) + 'px';
				this.renderLogContainer.style.left = ( parentNodeRect.left ) + 'px';
			}
		},

		updateRenderLogNode: function() {
			var logFragment = document.createDocumentFragment();

			if ( this.renderLogRenderCount ) {
				this.renderLogRenderCount.innerText = ( this.renderCountLog - 1 );
			}

			if ( this.renderLogDetail ) {
				this.renderLogDetail.innerHTML = '';
				for ( var i = 0; i < this.renderLog.length; i++ ) {
					var item = document.createElement( 'div' );
					item.innerText = this.renderLog[ i ];
					logFragment.appendChild( item );
				}

				this.renderLogDetail.appendChild( logFragment );
			}
		},

		removeRenderLogNode: function() {
			if ( this.renderLogContainer ) {
				document.getElementsByTagName( 'body' )[0].removeChild( this.renderLogContainer );
			}
		},

		addToRenderLog: function( message ) {
			this.renderLog.unshift( this.renderCountLog + ') ' + message );
			this.renderCountLog++;

			this.renderLog.splice( this.MAX_LOG_LENGTH, 1 );
		},


		getReasonForReRender: function( prevProps, prevState ) {
			var nextState = this.state,
				nextProps = this.props,
				key;

			for ( key in nextState ) {
				if ( nextState.hasOwnProperty( key ) && nextState[ key ] !== prevState[ key ] ) {
					if ( typeof nextState[ key ] === 'object' ) {
						return this.addToRenderLog( 'this.state[' + key + '] changed' );
					} else {
						return this.addToRenderLog( 'this.state[' + key + '] changed: \'' + prevState[ key ] + '\' => \'' + nextState[ key ] + '\'' );
					}
				}
			}

			for ( key in nextProps ) {
				if ( nextProps.hasOwnProperty( key ) && nextProps[ key ] !== prevProps[ key ] ) {
					if ( typeof nextProps[ key ] === 'object' ) {
						return this.addToRenderLog( 'this.props[' + key + '] changed' );
					} else {
						return this.addToRenderLog( 'this.props[' + key + '] changed: \'' + prevProps[ key ] + '\' => \'' + nextProps[ key ] + '\'' );
					}
				}
			}

			return this.addToRenderLog( 'unknown reason for update, possibly from forceUpdate()' );
		},

		highlightChange: function( change ) {
			var parentNode = ReactDom.findDOMNode(this),
				ANIMATION_DURATION = 500,
				self = this;

			if ( parentNode ) {
				parentNode.style.boxSizing = 'border-box';

				window.requestAnimationFrame( function highlightParentElementBorder() {
					parentNode.style.transition = 'outline 0s';
					if ( change === self.STATE_CHANGES.MOUNT ) {
						parentNode.style.outline = self.styling.elementHighlightMount.outline;
					} else {
						parentNode.style.outline = self.styling.elementHighlightUpdate.outline;
					}

					window.requestAnimationFrame( function animateParentElementBorder() {
						parentNode.style.outline = self.styling.elementHighlightMonitor.outline;
						parentNode.style.transition = 'outline ' + ANIMATION_DURATION + 'ms linear';
					});
				});
			}
		}
};

module.exports = RenderVisualizerMixin;
