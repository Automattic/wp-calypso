import type { Transition, Variants } from 'framer-motion';

// Spring physics configuration for smooth morphing
export const springConfig: Transition = {
	type: 'spring',
	stiffness: 300,
	damping: 30,
};

// Layout transition for morphing between states
export const layoutTransition: Transition = {
	type: 'spring',
	stiffness: 400,
	damping: 35,
};

// Fast spring for UI elements appearing
export const fastSpring: Transition = {
	type: 'spring',
	damping: 40,
	stiffness: 500,
	mass: 0.8,
};

// Fast spring with delay for sequential animations
export const fastSpringWithDelay: Transition = {
	...fastSpring,
	stiffness: 1000,
	damping: 90,
};

// Container morphing spring
export const morphSpring: Transition = {
	type: 'spring',
	damping: 40,
	stiffness: 400,
	mass: 0.8,
};

// Fade in/out animation
export const fadeVariants: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: springConfig,
	},
	exit: {
		opacity: 0,
		transition: { ...springConfig, duration: 0.1 },
	},
};

// Drag constraints - will be calculated based on viewport
export const getDragConstraints = () => {
	if ( typeof window === 'undefined' ) {
		return { left: 0, right: 0, top: 0, bottom: 0 };
	}

	const padding = 20;
	return {
		left: padding,
		right: window.innerWidth - 400 - padding, // Assuming max width of 400px
		top: padding,
		bottom: window.innerHeight - 60 - padding, // Assuming collapsed height of 60px
	};
};

// Thinking animation keyframes
export const thinkingGradientKeyframes = {
	'0%': { backgroundPosition: '-200% 0' },
	'100%': { backgroundPosition: '200% 0' },
};
