open Js;

let component = ReasonReact.statelessComponent "ReasonableDemo";

type actions =
  | Counter_Increment
  | Counter_Decrement
  | Counter_Add
  [@@bs.deriving {accessors: accessors}];

let make ::name ::count ::onClick _children => {
  let text = ReasonReact.stringToElement;
  let clickIt _event _state => onClick () [@bs];
  {
    ...component,
    render: fun self =>
      <div>
        <label> (text name) </label>
        <button _type="button" className="button is-compact" onClick=(self.update clickIt)>
          (text (" -> " ^ count))
        </button>
      </div>
  }
};

let comp =
  ReasonReact.wrapReasonForJs
    ::component
    (fun jsProps => make name::jsProps##name count::jsProps##count onClick::jsProps##onClick [||]);

let counter state::(state: undefined int) action => {
  let prev =
    switch (Undefined.to_opt state) {
    | Some s => s
    | None => 0
    };
  switch action##_type {
    | Counter_Increment => prev + 1
    | Counter_Decrement => prev - 1
    | Counter_Add => prev + action##amount
  }
};

