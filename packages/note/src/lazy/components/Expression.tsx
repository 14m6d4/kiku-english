import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";

export function Expression() {
  const { $ankiFields } = useAnkiFieldContext();
  return <>{$ankiFields.Expression}</>;
}
