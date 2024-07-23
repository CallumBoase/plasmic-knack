import React from 'react';

export type ExampleComponentProps = {
  whoToGreet: string;
};

export const ExampleComponent = ({ whoToGreet }: ExampleComponentProps) => {
  return <div>Example Component. Hello {whoToGreet}</div>;
};