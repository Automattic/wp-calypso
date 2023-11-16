import './style.scss';

( function ( $, document ) {
	const $document = $( document );

	$( function () {
		// The outer element, the content element, and the close button
		const $menu = $( '.x-menu' );
		const $menuContent = $menu.find( '.x-menu-content' );
		const $menuButton = $menu.find( '.x-menu-button' );

		// The menu trigger
		const $menuTrigger = $( '.x-nav-link--menu' );

		// Selectable menu items
		const $menuContentItems = $menuContent.find( '[role=menuitem]:visible' );
		const menuContentItemLength = $menuContentItems.length;

		// Widget init state
		let widgetActive = false;

		// Current states and values
		let currentState = false;
		let currentKeyboard = false;
		let currentKeyboardIndex = false;

		function activateWidget( delay ) {
			setTimeout( function () {
				if ( widgetActive ) {
					return;
				}
				$menu.addClass( 'x-menu--active' );
				widgetActive = true;
			}, delay || 0 );
		}

		function moveItemIndex( increment ) {
			let index = 0;

			if ( $.isNumeric( currentKeyboardIndex ) ) {
				index = currentKeyboardIndex;
			} else if ( increment > 0 ) {
				index = -1;
			}

			index = ( index + increment + menuContentItemLength ) % menuContentItemLength;
			const element = $menuContentItems[ index ];

			if ( element ) {
				element.focus();
			}
			currentKeyboardIndex = index;
		}

		function captureArrows() {
			if ( currentKeyboard ) {
				return;
			}

			currentKeyboard = true;
			currentKeyboardIndex = false;

			$document.on( 'keydown.x-menu', function ( $event ) {
				const triggerActive = $menuTrigger.get( 0 ) === document.activeElement;

				/* eslint-disable default-case */
				switch ( $event.which ) {
					case 38: // ↑
					case 37: // ←
						$event.preventDefault();
						moveItemIndex( -1 );
						break;
					case 40: // ↓
					case 39: // →
						$event.preventDefault();
						moveItemIndex( 1 );
						break;
					case 27: // escape
						if ( ! triggerActive ) {
							$menuTrigger.trigger( 'focus.x-menu' );
						}
						setCurrentState( false );
						break;
					case 9: // tab
						if ( ! triggerActive ) {
							$event.preventDefault();
							$menuTrigger.trigger( 'focus.x-menu' );
						}
						setCurrentState( false );
						break;
					/* eslint-enable default-case */
				}
			} );
		}

		function releaseArrows() {
			currentKeyboard = false;
			$document.off( 'keydown.x-menu' );
		}

		function setCurrentState( state ) {
			if ( ! widgetActive || state === currentState ) {
				return;
			}

			currentState = state;

			if ( state ) {
				captureArrows();
			} else {
				releaseArrows();
			}

			$menuTrigger.xAria( 'expanded', state );
			$menu.xAria( 'hidden', ! state );
			$menu.toggleClass( 'x-menu--open', state );
		}

		activateWidget();

		// Handle events
		$menuTrigger.on( 'click.x-menu', function ( $event ) {
			if ( ! widgetActive ) {
				return;
			}
			$event.stopPropagation();
			$menuTrigger.blur();
			setCurrentState( true );
		} );

		$menuButton.on( 'click.x-menu', function () {
			if ( ! widgetActive ) {
				return;
			}
			$menuButton.blur();
			setCurrentState( false );
		} );

		$menuContent.on( 'click.x-menu touchstart.x-menu', function ( $event ) {
			if ( ! widgetActive ) {
				return;
			}
			$event.stopPropagation();
		} );

		// Handle dismissal
		$document.on( 'click.x-menu touchstart.x-menu', function () {
			if ( ! widgetActive ) {
				return;
			}
			setCurrentState( false );
		} );
	} );
} )( window.jQuery, document );

( function ( $, window, document ) {
	const $window = $( window );
	const $document = $( document );

	/*
	 * Convert a jQuery collection into an array of separate jQuery elements.
	 */
	$.fn.xToArray = function () {
		return this.toArray().map( function ( element ) {
			return $( element );
		} );
	};
	/*
	 * Toggle the appropriate `aria` attribute. In case of `aria-hidden` being
	 * set to `true`, blur all elements inside.
	 */
	$.fn.xAria = function ( name, value ) {
		value = Boolean( value );
		this.attr( 'aria-' + name, value );

		if ( name === 'hidden' && value ) {
			// Blur all focusable elements
			this.find( '[tabindex], button, input, object, select, textarea' ).each(
				function ( _, element ) {
					element.blur();
				}
			);
		}
	};
	/*
	 * Create an object where the jQuery elements from the passed collection
	 * are grouped by a given data attribute value. The value is assumed to be
	 * unique for each of the elements.
	 */
	$.fn.xGroupByData = function ( key ) {
		const group = {};
		let data;

		this.xToArray().forEach( function ( $element ) {
			data = $element.data( key );
			if ( data ) {
				group[ data ] = $element;
			}
		} );

		return group;
	};

	/*
	 * Create a shallow copy of the given object.
	 */
	$.xCloneObject = function ( object ) {
		return $.extend( {}, object );
	};

	/*
	 * Set opacity.
	 */
	$.fn.xOpacity = function ( value ) {
		return this.each( function () {
			this.style.opacity = value;
		} );
	};

	/*
	 * Find the maximum value in an array or an object.
	 */
	$.xMax = function ( items ) {
		if ( $.isPlainObject( items ) ) {
			items = $.xObjectValues( items );
		}

		return items.reduce( function ( memo, value ) {
			return Math.max( memo, value );
		}, 0 );
	};

	/*
	 * Set a transform value based on the coordinates and scale.
	 */
	$.fn.xTransform = function ( x, y, z, scale ) {
		const coordinates = [ x, y, z ].map( function ( value ) {
			return value ? value + 'px' : 0;
		} );

		let value = 'translate3d(' + coordinates.join( ', ' ) + ')';
		if ( $.isNumeric( scale ) ) {
			value += ' scale(' + scale + ')';
		}

		return this.each( function () {
			this.style.transform = value;
		} );
	};

	/*
	 * Flatten an object to a single level.
	 */
	$.xFlattenObject = function xFlattenObject( object ) {
		const result = {};

		$.each( object, function ( key, value ) {
			if ( ! $.isPlainObject( value ) ) {
				result[ key ] = value;
				return;
			}

			$.each( xFlattenObject( value ), function ( _key, _value ) {
				result[ key + '.' + _key ] = _value;
			} );
		} );

		return result;
	};

	/*
	 * Translate all items inside an object to a new object.
	 */
	$.xMapPlainObject = function ( items, callback ) {
		const isValue = ! $.isFunction( callback );

		return Object.keys( items ).reduce( function ( memo, key ) {
			const copy = {};
			copy[ key ] = isValue ? callback : callback( key, items[ key ], items );
			return $.extend( {}, memo, copy );
		}, {} );
	};

	/*
	 * Return an array of a given object’s own property values.
	 * An equivalent of `Object.values()`.
	 */
	$.xObjectValues = function ( object ) {
		return Object.keys( object ).map( function ( key ) {
			return object[ key ];
		} );
	};

	$( function () {
		// The main positioning element (animated)
		const $dropdown = $( '.x-dropdown' );

		// The background element with “animated height”
		const $dropdownBackground = $dropdown.find( '.x-dropdown-bottom' );
		const $dropdownBackgroundFill = $dropdownBackground.find( '.x-dropdown-bottom-fill' );

		// Dropdown contents, first in a jQuery collection, then as a group object
		const $dropdownContents = $dropdown.find( '.x-dropdown-content' );
		const dropdownContents = $dropdownContents.xGroupByData( 'dropdown-name' );
		const dropdownContentKeys = Object.keys( dropdownContents );

		// Selectable links grouped by dropdown content key, with disabled tab switching
		const dropdownContentItems = $.xMapPlainObject( dropdownContents, function ( _, $element ) {
			return $element.find( '[role=menuitem]:visible' );
		} );

		// Dropdown triggers, used for determining the attachment position
		const $dropdownTriggers = $( '[data-dropdown-trigger]' );
		const dropdownTriggers = $dropdownTriggers.xGroupByData( 'dropdown-trigger' );

		// Static properties
		const dropdownHiddenOffset = -6;
		const dropdownHiddenScale = 0.85;

		// Collected element sizes and positions, etc.
		let dropdownWidth = 0;
		let dropdownBackgroundHeight = 0;
		let dropdownContentHeights = {};
		let dropdownContentOffsets = {};

		function resizeElements() {
			// Collect
			dropdownWidth = $dropdown.outerWidth();
			dropdownContentHeights = $.xMapPlainObject( dropdownContents, function ( _, $element ) {
				return $element.outerHeight();
			} );
			dropdownBackgroundHeight = $.xMax( dropdownContentHeights );
			dropdownContentOffsets = $.xMapPlainObject( dropdownTriggers, function ( _, $element ) {
				const width = $element.outerWidth();
				const offset = $element.offset();
				return Math.round( offset.left + ( width - dropdownWidth ) / 2 );
			} );

			// Apply
			$dropdownBackground.height( dropdownBackgroundHeight );
			$dropdownBackgroundFill.height( dropdownBackgroundHeight );
		}

		// Current states and values
		let currentName;
		let currentDropdownOpacity;
		const currentDropdownContentOpacity = $.xMapPlainObject( dropdownContents, 0 );
		let currentDropdownTransform = {};
		let currentDropdownHeight;
		let currentAnimation;
		let currentKeyboardIndex;

		function setCurrentName( name ) {
			currentName = name;
			currentKeyboardIndex = false;
			$.each( dropdownContents, function ( key, $element ) {
				$element.xAria( 'hidden', key !== name );
			} );
		}

		function broadcastEvent( type, name, data ) {
			data = $.extend( data || {}, { name: name } );
			$document.trigger( 'x-dropdown.' + type, data );
		}

		// Animated properties
		function updateDropdownOpacity( value, forceUpdate ) {
			if ( ! forceUpdate && value === currentDropdownOpacity ) {
				return;
			}
			$dropdown.xOpacity( value );
			currentDropdownOpacity = value;
		}

		function updateDropdownContentOpacity( values, forceUpdate ) {
			dropdownContentKeys.forEach( function ( key ) {
				const value = values[ 'contents.opacity.' + key ];
				if ( ! forceUpdate && value === currentDropdownContentOpacity[ key ] ) {
					return;
				}
				dropdownContents[ key ].xOpacity( value );
				currentDropdownContentOpacity[ key ] = value;
			} );
		}

		function updateDropdownTransform( values, forceUpdate ) {
			const x = values.x || 0;
			const y = values.y || 0;
			const scale = values.scale;
			const current = currentDropdownTransform;

			if ( ! forceUpdate && current.x === x && current.y === y && current.scale === scale ) {
				return;
			}
			$dropdown.xTransform( x, y, 0, scale );
			currentDropdownTransform = { x: x, y: y, scale: scale };
		}

		function updateDropdownHeight( value, forceUpdate ) {
			value = Math.min( value, dropdownBackgroundHeight );
			if ( ! forceUpdate && value === currentDropdownHeight ) {
				return;
			}
			$dropdownBackgroundFill.xTransform( 0, value - dropdownBackgroundHeight );
			currentDropdownHeight = value;
		}

		function updateDropdownProperties( values, forceUpdate ) {
			updateDropdownOpacity( values[ 'dropdown.opacity' ], forceUpdate );
			updateDropdownContentOpacity( values, forceUpdate );
			updateDropdownTransform(
				{
					x: values[ 'dropdown.transform.x' ],
					y: values[ 'dropdown.transform.y' ],
					scale: values[ 'dropdown.transform.scale' ],
				},
				forceUpdate
			);
			updateDropdownHeight( values[ 'dropdown.height' ], forceUpdate );
		}

		function show( name, animate ) {
			// Treat unavailable dropdown names as close calls
			if ( dropdownContentKeys.indexOf( name ) < 0 ) {
				name = false;
			}

			// Abort if the state remains unchanged
			if ( currentName === name ) {
				return;
			}

			// If there is an animation running, stop it
			if ( currentAnimation ) {
				currentAnimation.stop();
			}

			// State helpers
			const isHidden = ! currentName && ! ( currentAnimation && currentAnimation.running );
			const isHiding = ! name;

			// Define from-to states for each of the animated properties
			const animationFrom = {
				dropdown: isHidden
					? {
							height: dropdownContentHeights[ name ],
							opacity: currentDropdownOpacity,
							transform: {
								x: dropdownContentOffsets[ name ],
								y: dropdownHiddenOffset,
								scale: dropdownHiddenScale,
							},
					  }
					: {
							height: currentDropdownHeight,
							opacity: currentDropdownOpacity,
							transform: currentDropdownTransform,
					  },
				contents: {
					opacity: isHidden
						? $.xMapPlainObject( currentDropdownContentOpacity, 0 )
						: currentDropdownContentOpacity,
				},
			};

			const animationTo = {
				dropdown: isHiding
					? {
							height: currentDropdownHeight,
							opacity: 0,
							transform: {
								x: currentDropdownTransform.x,
								y: dropdownHiddenOffset,
								scale: dropdownHiddenScale,
							},
					  }
					: {
							height: dropdownContentHeights[ name ],
							opacity: 1,
							transform: {
								x: dropdownContentOffsets[ name ],
								y: 0,
								scale: 1,
							},
					  },
				contents: {
					opacity: isHiding
						? currentDropdownContentOpacity
						: $.xMapPlainObject( currentDropdownContentOpacity, function ( key ) {
								return name === key ? 1 : 0;
						  } ),
				},
			};

			const animationProperties = {
				from: $.xFlattenObject( animationFrom ),
				to: $.xFlattenObject( animationTo ),
				duration: isHiding ? 150 : 450,
				ease: isHiding ? 'quadraticOut' : 'quinticOut',
			};

			setCurrentName( name );

			if ( ! animate ) {
				updateDropdownProperties( animationProperties.to );
			} else {
				currentAnimation = $.xTween( animationProperties ).start( {
					update: updateDropdownProperties,
					complete: function () {
						currentAnimation = false;
					},
				} );
			}
		}

		// Trigger element calculations and handle browser events
		function handleResize() {
			show( false );
			resizeElements();
		}

		function handleLoad() {
			resizeElements();
		}

		function handleScroll() {
			show( false, true );
		}

		handleResize();
		$window.on( 'resize', handleResize );
		$window.on( 'load', handleLoad );
		$window.on( 'scroll', handleScroll );
		$window.on( 'x-detected.dynamic-type', handleResize );

		// Handle events sent by other components
		$document.on( 'x-trigger.select', function ( _, data ) {
			show( data.name, true );
		} );

		$document.on( 'x-trigger.arrow-down', function () {
			if ( $.isNumeric( currentKeyboardIndex ) ) {
				currentKeyboardIndex += 1;
			} else {
				currentKeyboardIndex = 0;
			}
		} );

		$document.on( 'x-trigger.arrow-up', function () {
			if ( $.isNumeric( currentKeyboardIndex ) ) {
				currentKeyboardIndex -= 1;
			} else {
				currentKeyboardIndex = -1;
			}
		} );

		// Handle keyboard focus
		$document.on( 'x-trigger.arrow-up x-trigger.arrow-down', function () {
			const items = dropdownContentItems[ currentName ];
			const length = items.length;
			const index = ( currentKeyboardIndex + length ) % length;
			const element = items[ index ];
			if ( element ) {
				element.focus();
			}
			currentKeyboardIndex = index;
		} );

		// Broadcast mouse events to other components
		$.each( dropdownContents, function ( key, $element ) {
			[ 'mouseenter', 'mouseleave' ].forEach( function ( type ) {
				$element.on( type, function () {
					broadcastEvent( type, key );
				} );
			} );
		} );
	} );

	$( function () {
		// Triggers, first in a jQuery collection, then as a group object
		const $triggers = $( '[data-dropdown-trigger]' );
		const triggers = $triggers.xGroupByData( 'dropdown-trigger' );

		// Current states and values
		let currentName;
		let currentTimeout;
		let currentKeyboard;

		function setCurrentName( name ) {
			currentName = name;
			$.each( triggers, function ( key, $element ) {
				$element.xAria( 'expanded', key === name );
			} );
		}

		function broadcastEvent( type, name, data ) {
			data = $.extend( data || {}, { name: name } );
			$document.trigger( 'x-trigger.' + type, data );
		}

		function captureArrows() {
			if ( currentKeyboard ) {
				return;
			}

			currentKeyboard = true;

			$document.on( 'keydown.x-trigger', function ( $event ) {
				const $trigger = triggers[ currentName ];
				const triggerActive = $trigger && $trigger.get( 0 ) === document.activeElement;

				/* eslint-disable default-case */
				switch ( $event.which ) {
					case 38: // ↑
					case 37: // ←
						$event.preventDefault();
						broadcastEvent( 'arrow-up', currentName );
						break;
					case 40: // ↓
					case 39: // →
						$event.preventDefault();
						broadcastEvent( 'arrow-down', currentName );
						break;
					case 27: // escape
						if ( ! triggerActive ) {
							$trigger.trigger( 'focus.x-trigger' );
						}
						show( 0, false, { keyboard: true } );
						break;
					case 9: // tab
						if ( ! triggerActive ) {
							$event.preventDefault();
							$trigger.trigger( 'focus.x-trigger' );
						}
						show( 0, false, { keyboard: true } );
						break;
					/* eslint-enable default-case */
				}
			} );
		}

		function releaseArrows() {
			currentKeyboard = false;
			$document.off( 'keydown.x-trigger' );
		}

		function show( delay, name, data ) {
			const callback = function () {
				setCurrentName( name );
				broadcastEvent( 'select', name, data );

				if ( name ) {
					captureArrows();
				} else {
					releaseArrows();
				}
			};

			clearTimeout( currentTimeout );
			currentTimeout = setTimeout( callback, delay );
		}

		// Trigger logic
		$.each( triggers, function ( key, $element ) {
			$element.on( 'click.x-trigger touchstart.x-trigger', function ( $event ) {
				$event.stopPropagation();
				$event.target.blur();
				show( 0, key );
			} );

			$element.on( 'focus.x-trigger', function () {
				show( 0, key, { keyboard: true } );
			} );

			$element.on( 'mouseenter.x-trigger', function () {
				show( currentName ? 0 : 150, key );
			} );

			$element.on( 'mouseleave.x-trigger', function () {
				show( 50, false );
			} );
		} );

		// Handle events sent by other components
		$document.on( 'x-dropdown.mouseenter', function ( _, data ) {
			show( 0, data.name );
		} );

		$document.on( 'x-dropdown.mouseleave', function () {
			show( 350, false );
		} );

		// Handle dismissal
		$document.on( 'click.x-trigger', function () {
			show( 50, false );
		} );

		// Reset the state on resize
		function handleResize() {
			show( 0, false );
		}

		handleResize();
		$window.on( 'resize', handleResize );
	} );
} )( window.jQuery, window, document );

( function ( $ ) {
	const scheduleFrame = window.requestAnimationFrame;

	// Borrowed from Tween.js
	const EASING_FUNCTIONS = {
		linear: function ( k ) {
			return k;
		},
		quadraticOut: function ( k ) {
			return k * ( 2 - k );
		},
		quinticOut: function ( k ) {
			// Almost indistinguishable from `cubicBezier(0.1, 0.6, 0.2, 1)`
			return --k * k * k * k * k + 1;
		},
	};

	function Tween( properties ) {
		this.running = false;

		this._valuesFrom = $.xCloneObject( properties.from );
		this._valuesTo = $.xCloneObject( properties.to );

		this._duration = properties.duration;
		this._ease = EASING_FUNCTIONS[ properties.ease ] || EASING_FUNCTIONS.linear;

		return this;
	}

	Tween.prototype.start = function ( properties ) {
		this._onUpdateCallback = properties.update;
		this._onEndCallback = properties.end;

		if ( ! $.isFunction( this._onUpdateCallback ) ) {
			this._onUpdateCallback = $.noop;
		}
		if ( ! $.isFunction( this._onEndCallback ) ) {
			this._onEndCallback = $.noop;
		}

		this._startAnimation();
		return this;
	};

	Tween.prototype.stop = function () {
		if ( ! this.running ) {
			return this;
		}

		this._interrupted = true;
		this._endAnimation();
		return this;
	};

	Tween.prototype._startAnimation = function () {
		this.running = true;
		this._interrupted = false;
		this._start = performance.now();
		scheduleFrame( this._runAnimation.bind( this ) );
	};

	Tween.prototype._runAnimation = function () {
		if ( ! this.running ) {
			return;
		}

		this._nextFrame();
		scheduleFrame( this._runAnimation.bind( this ) );
	};

	Tween.prototype._updateAnimation = function () {
		const currentValues = this._getInterpolatedValues();
		this._onUpdateCallback( currentValues, this._progress );
	};

	Tween.prototype._endAnimation = function () {
		this.running = false;

		if ( ! this._interrupted ) {
			this._onUpdateCallback( $.xCloneObject( this._valuesTo ), 1 );
		}

		this._onEndCallback();
	};

	Tween.prototype._nextFrame = function () {
		this._progress = ( performance.now() - this._start ) / this._duration;

		if ( this._progress < 1 ) {
			this._updateAnimation();
		} else {
			this._endAnimation();
		}
	};

	Tween.prototype._getInterpolatedValues = function () {
		const values = {};

		Object.keys( this._valuesFrom ).forEach(
			function ( key ) {
				let valueFrom = this._valuesFrom[ key ];
				let valueTo = this._valuesTo[ key ];

				if ( ! $.isNumeric( valueFrom ) ) {
					valueFrom = 0;
				}
				if ( ! $.isNumeric( valueTo ) ) {
					valueTo = 0;
				}

				values[ key ] = this._ease( this._progress ) * ( valueTo - valueFrom ) + valueFrom;
			}.bind( this )
		);

		return values;
	};

	// Expose the constructor
	$.xTween = function ( properties ) {
		return new Tween( properties );
	};
} )( window.jQuery, window, document );
