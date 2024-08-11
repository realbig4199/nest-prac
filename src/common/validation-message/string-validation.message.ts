import { ValidationArguments } from 'class-validator';

export const stringValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments의 프로퍼티들
   *
   * 1. value : 검증 되고 있는 값
   * 2. constraints : 파라미터에 입력된 제한 사항들
   * 3. targetName : 검증 되고 있는 클래스의 이름
   * 4. object : 검증되고 있는 객체
   * 5. property : 검증되고 있는 객체의 프로퍼티 이름
   */
  return `${args.property}은 string 타입이어야 합니다.`;
};
