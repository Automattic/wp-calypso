$(".project-title").velocity(
  { 
    opacity: 1
  },
  { 
		duration: 1400,
		easing: "cubic-bezier",
		delay: 1000
  }
);


$(".project-desc").velocity(
  { 
    opacity: 1,
		top: 0
  },
  { 
		duration: 600,
		easing: "ease-in",
		delay: 2000
  }
);

$(".git-button").velocity(
  { 
    opacity: 1,
		top: 0
  },
  { 
		duration: 600,
		easing: "ease-in",
		delay: 2000
  }
);

$(".editor-outer").velocity(
  { 
    opacity: 1,
		bottom: 0
  },
  { 
		duration: 800,
		easing: "linear",
		delay: 500
  }
);
