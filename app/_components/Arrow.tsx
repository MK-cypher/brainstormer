import React from "react";

export default function Arrow({width, height}: {width: number; height: number}) {
  return (
    <svg fill="#fff" width={width} height={height} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
    </svg>
  );
}
